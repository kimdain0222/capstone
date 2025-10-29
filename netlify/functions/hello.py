import json

def handler(event, context):
    """
    Netlify Functions의 기본 핸들러
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        },
        'body': json.dumps({
            'message': 'Hello from Netlify Functions!',
            'event': event
        })
    }
