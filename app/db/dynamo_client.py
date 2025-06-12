import boto3
import os
from dotenv import load_dotenv

load_dotenv()  

dynamodb = boto3.resource(
    'dynamodb',
    region_name='us-east-1',  
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)


def create_workouts_table():
    existing_tables = list(dynamodb.tables.all())
    if any(table.name == "workouts" for table in existing_tables):
        print("✅ 'workouts' table already exists.")
        return

    table = dynamodb.create_table(
        TableName='workouts',
        KeySchema=[
            {'AttributeName': 'user_id', 'KeyType': 'HASH'},      
            {'AttributeName': 'workout_id', 'KeyType': 'RANGE'}   
        ],
        AttributeDefinitions=[
            {'AttributeName': 'user_id', 'AttributeType': 'S'},
            {'AttributeName': 'workout_id', 'AttributeType': 'S'}
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    )

    # Wait for it to be active
    table.wait_until_exists()
    print("✅ 'workouts' table created.")
