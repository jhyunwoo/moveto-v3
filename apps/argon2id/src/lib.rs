use worker::*;
use serde::{Deserialize, Serialize};
use argon2::{
    password_hash::{PasswordHasher, SaltString, PasswordHash, PasswordVerifier},
    Argon2, Algorithm, Version, Params
};
use rand_core::OsRng;

#[derive(Deserialize, Serialize)]
struct RequestData {
    text: String,
}

#[derive(Serialize)]
struct ResponseData {
    hash: String,
}

#[derive(Deserialize, Serialize)]
struct VerifyRequestData {
    hash: String,
    text: String,
}

#[derive(Serialize)]
struct VerifyResponseData {
    valid: bool,
}

fn hash_password(text: &str) -> Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    let params = Params::new(
        102400, // 100 MB
        2,      // t_cost
        1,      // p_cost
        None    // output_len
    ).map_err(|e| Error::RustError(e.to_string()))?;

    let argon2 = Argon2::new(
        Algorithm::Argon2id,
        Version::V0x13,
        params,
    );
    
    let password_hash = argon2.hash_password(text.as_bytes(), &salt)
        .map_err(|e| Error::RustError(e.to_string()))?;
        
    Ok(password_hash.to_string())
}

fn verify_password(hash: &str, text: &str) -> Result<bool> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| Error::RustError(e.to_string()))?;

    let argon2 = Argon2::default();
    
    match argon2.verify_password(text.as_bytes(), &parsed_hash) {
        Ok(_) => Ok(true),
        Err(argon2::password_hash::Error::Password) => Ok(false),
        Err(e) => Err(Error::RustError(e.to_string())),
    }
}

mod openapi;

#[event(fetch)]
async fn fetch(
    mut req: Request,
    _env: Env,
    _ctx: Context,
) -> Result<Response> {
    console_error_panic_hook::set_once();
    
    // Handle CORS/Preflight if needed (optional for now, but good practice)
    
    let path = req.path();
    match (req.method(), path.as_str()) {
        (Method::Post, "/") => {
             // Continue to existing hash logic
        },
        (Method::Post, "/verify") => {
             // Continue to verify logic
        },
        (Method::Get, "/openapi.json") => {
            let mut headers = Headers::new();
            headers.set("Content-Type", "application/json")?;
            return Response::ok(openapi::OPENAPI_JSON)
                .map(|r| r.with_headers(headers));
        },
        (Method::Get, "/docs") => {
            return Response::from_html(openapi::SCALAR_HTML);
        },
        _ => {
            if req.method() != Method::Post && (path == "/" || path == "/verify") {
                 return Response::error("Method Not Allowed", 405);
            }
             return Response::error("Not Found", 404);
        }
    }

    if req.method() != Method::Post {
        // This check is redundant with the match above but kept for structure from previous step
        return Response::error("Method Not Allowed", 405);
    }

    match path.as_str() {
        "/" => {
            let data: RequestData = match req.json().await {
                Ok(d) => d,
                Err(_) => return Response::error("Invalid JSON", 400),
            };

            match hash_password(&data.text) {
                Ok(hash) => {
                    let resp_data = ResponseData { hash };
                    Response::from_json(&resp_data)
                },
                Err(e) => Response::error(e.to_string(), 500),
            }
        },
        "/verify" => {
            let data: VerifyRequestData = match req.json().await {
                Ok(d) => d,
                Err(_) => return Response::error("Invalid JSON", 400),
            };

            match verify_password(&data.hash, &data.text) {
                Ok(valid) => {
                    let resp_data = VerifyResponseData { valid };
                    Response::from_json(&resp_data)
                },
                Err(e) => Response::error(e.to_string(), 500),
            }
        },
        _ => Response::error("Not Found", 404),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hash_password() {
        let text = "test_text";
        let hash = hash_password(text).unwrap();
        assert!(hash.starts_with("$argon2id$"));
    }

    #[test]
    fn test_verify_password() {
        let text = "test_verify";
        let hash = hash_password(text).unwrap();
        
        assert!(verify_password(&hash, text).unwrap());
        assert!(!verify_password(&hash, "wrong_password").unwrap());
    }

    #[test]
    fn test_openapi_json_validity() {
        let json: serde_json::Value = serde_json::from_str(openapi::OPENAPI_JSON)
            .expect("OpenAPI JSON should be valid");
        assert!(json.get("paths").is_some());
    }
}