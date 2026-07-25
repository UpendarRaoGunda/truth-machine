import base64
import hashlib
import hmac
import json
import unittest

from app.core import detect_format, report_contains_prohibited_inference, safe_filename, validate_bundle, verify_upload_token


def token(secret: str, payload: dict) -> str:
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), encoded.encode(), hashlib.sha256).digest()).decode().rstrip("=")
    return f"{encoded}.{signature}"


class CoreTests(unittest.TestCase):
    def test_signed_token(self):
        value = token("secret", {"aud":"truth-machine-ancestry-upload","iat":90,"exp":200,"maxBytes":10,"maxFiles":1})
        self.assertEqual(verify_upload_token("secret", value, now=100)["maxFiles"], 1)
        with self.assertRaises(ValueError): verify_upload_token("wrong", value, now=100)

    def test_filename_hardening(self):
        self.assertEqual(safe_filename("../../sample.vcf"), "sample.vcf")
        with self.assertRaises(ValueError): safe_filename("malware.exe")

    def test_complete_plink_bundle(self):
        with self.assertRaises(ValueError): validate_bundle([{"name":"a.bed","size":10}], 100)
        result = validate_bundle([{"name":"a.bed","size":10},{"name":"a.bim","size":10},{"name":"a.fam","size":10}],100)
        self.assertEqual(len(result),3)

    def test_format_and_guardrails(self):
        self.assertEqual(detect_format("a.vcf","##fileformat=VCFv4.2"),"vcf")
        self.assertTrue(report_contains_prohibited_inference({"result":"racial purity score"}))
        self.assertFalse(report_contains_prohibited_inference({"result":"population affinity with uncertainty"}))


if __name__ == "__main__": unittest.main()
