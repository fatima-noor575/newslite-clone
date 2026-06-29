from auth.security import hash_password, verify_password, create_access_token, decode_token

def test_password_hashing():
    h = hash_password("secret123")
    assert verify_password("secret123", h)
    assert not verify_password("wrong", h)

def test_jwt_roundtrip(monkeypatch):
    tok = create_access_token("u@example.com")
    payload = decode_token(tok)
    assert payload["sub"] == "u@example.com"
