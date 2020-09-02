import json,boto3,time,base64,hashlib,re
from urllib.parse import unquote

s3 = boto3.client('s3')
bucket_name = '{{S3_Server_Bucket}}'

def storeData(event, context):
    if 'body' in event.keys():
        data = json.loads(event['body'])
        path = ''
        filename = ''
        raw_path = re.sub('^(\.{1,2}\/)*','',unquote(data['path'])).strip('/').lower()
        url_parts = raw_path.split('?')
        if len(url_parts) == 1:
            path_parts = url_parts[0].split('/')   
            if len(path_parts) == 1:
                if path_parts[0] == '':
                    filename = '/index.html'
                else:
                    filename = '/' +(path_parts[0] + '.html' if '.' not in path_parts[0] else path_parts[0])
            elif len(path_parts) > 1:
                path = '/' + '/'.join(path_parts[:-1])
                filename = '/' + (path_parts[-1] + '.html' if '.' not in path_parts[-1] else path_parts[-1])
        elif len(url_parts) == 2:
            if url_parts[0] == '':
                path = '/index'
            else:
                path = '/' + url_parts[0].split('.')[0]
            filename = '/%s.html'%(hashlib.md5(url_parts[1].encode()).hexdigest())

        file_data = base64.b64decode(data['body']).decode('utf-8')
        if file_data.startswith('data:image'):
            file_data = base64.decodebytes(bytes(file_data.split(',')[1],'utf-8'))
        
        s3_response = s3.put_object(
            Bucket=bucket_name,
            Key=data['site']+path+filename,
            Body=file_data,
            ACL='private'
        )

    response = {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps(s3_response),
    }

    return response