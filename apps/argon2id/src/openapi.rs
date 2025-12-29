pub const OPENAPI_JSON: &str = r#"{
  "openapi": "3.0.0",
  "info": {
    "title": "Argon2id Hashing API",
    "version": "1.0.0"
  },
  "paths": {
    "/": {
      "post": {
        "summary": "Hash text using Argon2id",
        "description": "Hashes the input text using the Argon2id algorithm with 100MB memory cost.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "text": {
                    "type": "string",
                    "example": "my_secret_password"
                  }
                },
                "required": ["text"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Successful hashing",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "hash": {
                      "type": "string",
                      "example": "$argon2id$v=19$m=102400,t=2,p=1$..."
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid Request",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string",
                  "example": "Invalid JSON"
                }
              }
            }
          },
          "405": {
            "description": "Method Not Allowed",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string",
                  "example": "Method Not Allowed"
                }
              }
            }
          }
        }
      }
    },
    "/verify": {
      "post": {
        "summary": "Verify a password against a hash",
        "description": "Verifies if the provided text matches the given Argon2id hash.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "hash": {
                    "type": "string",
                    "example": "$argon2id$v=19$m=102400,t=2,p=1$..."
                  },
                  "text": {
                    "type": "string",
                    "example": "my_secret_password"
                  }
                },
                "required": ["hash", "text"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Verification result",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "valid": {
                      "type": "boolean",
                      "example": true
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid Request",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string",
                  "example": "Invalid JSON"
                }
              }
            }
          },
          "405": {
            "description": "Method Not Allowed",
            "content": {
              "text/plain": {
                "schema": {
                  "type": "string",
                  "example": "Method Not Allowed"
                }
              }
            }
          }
        }
      }
    }
  }
}"#;

pub const SCALAR_HTML: &str = r#"
<!doctype html>
<html>
  <head>
    <title>Argon2id API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
"#;
