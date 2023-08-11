from flask import Flask, request, jsonify
from google.cloud import firestore
from google.oauth2 import service_account
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

app = Flask(__name__)

# Load your Google Cloud service account key JSON file
# Replace 'path/to/your/credentials.json' with the actual path to your credentials file
credentials = service_account.Credentials.from_service_account_file('/home/osanda/Downloads/devops-osanda-02a3c26475e3.json')
db = firestore.Client(credentials=credentials)

# Azure Document Extractor configuration
endpoint = "https://test-ncinga-osanda-1.cognitiveservices.azure.com/"
key = "a25ae10b10af4556bf1a9462399f4c7b"
model_id = "train-version-2"

document_analysis_client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

@app.route('/', methods=['GET'])
def index():
    return app.send_static_file('index.html')

@app.route('/upload', methods=['POST'])
def upload_document():
    if 'document' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    document = request.files['document']
    if document.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Read the uploaded document content as bytes
        document_content = document.read()

        # Analyze the uploaded document using Azure Document Extractor
        poller = document_analysis_client.begin_analyze_document(model_id, document_content)
        result = poller.result()

        extracted_data = []

        for idx, document in enumerate(result.documents):
            for name, field in document.fields.items():
                field_value = field.value if field.value else field.content
                extracted_data.append({'name': name, 'value': field_value})

        return jsonify(extracted_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/save-to-firestore', methods=['POST'])
def save_to_firestore():
    try:
        data = request.get_json()
        batch = db.batch()

        for item in data:
            doc_ref = db.collection('alliance-poc-docai').document()
            batch.set(doc_ref, item)

        batch.commit()
        return jsonify({'message': 'Data saved to Firestore successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
