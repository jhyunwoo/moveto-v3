use worker::*;
use serde::{Deserialize, Serialize};
use argon2::{
    password_hash::{PasswordHasher, SaltString},
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
             // Continue to existing logic
        },
        (Method::Get, "/openapi.json") => {
            let mut headers = Headers::new();
            headers.set("Content-Type", "application/json")?;
            return Response::ok(openapi::OPENAPI_JSON)
                .map(|r| r.with_headers(headers));
        },
        (Method::Get, "/doc") => {
            return Response::from_html(openapi::SCALAR_HTML);
        },
        _ => {
            if req.method() != Method::Post && path == "/" {
                 return Response::error("Method Not Allowed", 405);
            }
             return Response::error("Not Found", 404);
        }
    }

    if req.method() != Method::Post {
        // This check is redundant with the match above but kept for structure from previous step
        return Response::error("Method Not Allowed", 405);
    }

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
}