import boto3
from botocore.exceptions import ClientError
import os

class S3Client:
    def __init__(self):
        self.endpoint_url = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
        self.access_key = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
        self.secret_key = os.getenv("MINIO_SECRET_KEY", "minioadmin")
        self.bucket = os.getenv("MINIO_BUCKET", "events")
        self.use_ssl = os.getenv("MINIO_USE_SSL", "false").lower() == "true"
        
        self.client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            use_ssl=self.use_ssl,
            verify=False
        )

        try:
            self.client.head_bucket(Bucket=self.bucket)
        except:
            self.client.create_bucket(Bucket=self.bucket)
    
    def upload_file(self, file, filename: str) -> str:
        self.client.upload_fileobj(file, self.bucket, filename)
        return filename
    
    def get_presigned_url(self, filename: str, expires: int = 3600) -> str:
        if not filename:
            return None
        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': filename},
            ExpiresIn=expires
        )
    
    def delete_file(self, filename: str) -> bool:
        try:
            self.client.delete_object(Bucket=self.bucket, Key=filename)
            return True
        except ClientError:
            return False

s3_client = S3Client()
