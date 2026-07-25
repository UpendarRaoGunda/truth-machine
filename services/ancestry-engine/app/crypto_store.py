from __future__ import annotations

import base64
import os
from pathlib import Path
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

MAGIC=b"TMG1"; IV_BYTES=12; TAG_BYTES=16; CHUNK_BYTES=1024*1024

class EncryptedStore:
    def __init__(self, encoded_key: str):
        if not encoded_key: raise RuntimeError("GENOME_ENCRYPTION_KEY is required")
        try: key=base64.urlsafe_b64decode(encoded_key+"="*(-len(encoded_key)%4))
        except Exception as exc: raise RuntimeError("GENOME_ENCRYPTION_KEY must be URL-safe base64") from exc
        if len(key)!=32: raise RuntimeError("GENOME_ENCRYPTION_KEY must decode to exactly 32 bytes")
        self.key=key

    async def encrypt_upload(self, upload, destination: Path, maximum_bytes: int) -> int:
        destination.parent.mkdir(parents=True, exist_ok=True); iv=os.urandom(IV_BYTES)
        encryptor=Cipher(algorithms.AES(self.key),modes.GCM(iv)).encryptor(); total=0
        with destination.open("wb") as target:
            target.write(MAGIC); target.write(iv)
            while True:
                chunk=await upload.read(CHUNK_BYTES)
                if not chunk: break
                total+=len(chunk)
                if total>maximum_bytes: raise ValueError("Uploaded data exceeds the authorised size")
                target.write(encryptor.update(chunk))
            target.write(encryptor.finalize()); target.write(encryptor.tag)
        return total

    def encrypt_bytes(self, value: bytes, destination: Path) -> None:
        destination.parent.mkdir(parents=True, exist_ok=True); iv=os.urandom(IV_BYTES)
        encryptor=Cipher(algorithms.AES(self.key),modes.GCM(iv)).encryptor()
        destination.write_bytes(MAGIC+iv+encryptor.update(value)+encryptor.finalize()+encryptor.tag)

    def decrypt_bytes(self, source: Path) -> bytes:
        data=source.read_bytes()
        if len(data)<len(MAGIC)+IV_BYTES+TAG_BYTES or data[:4]!=MAGIC: raise ValueError("Invalid encrypted file")
        iv=data[4:4+IV_BYTES]; tag=data[-TAG_BYTES:]; ciphertext=data[4+IV_BYTES:-TAG_BYTES]
        decryptor=Cipher(algorithms.AES(self.key),modes.GCM(iv,tag)).decryptor()
        return decryptor.update(ciphertext)+decryptor.finalize()

    def decrypt_file(self, source: Path, destination: Path) -> None:
        size=source.stat().st_size
        if size<len(MAGIC)+IV_BYTES+TAG_BYTES: raise ValueError("Invalid encrypted file")
        with source.open("rb") as input_file:
            if input_file.read(4)!=MAGIC: raise ValueError("Invalid encrypted file")
            iv=input_file.read(IV_BYTES); input_file.seek(-TAG_BYTES,os.SEEK_END); tag=input_file.read(TAG_BYTES)
            ciphertext_end=size-TAG_BYTES; input_file.seek(4+IV_BYTES)
            decryptor=Cipher(algorithms.AES(self.key),modes.GCM(iv,tag)).decryptor(); destination.parent.mkdir(parents=True,exist_ok=True)
            with destination.open("wb") as output_file:
                remaining=ciphertext_end-(4+IV_BYTES)
                while remaining>0:
                    chunk=input_file.read(min(CHUNK_BYTES,remaining))
                    if not chunk: raise ValueError("Truncated encrypted file")
                    remaining-=len(chunk); output_file.write(decryptor.update(chunk))
                output_file.write(decryptor.finalize())
