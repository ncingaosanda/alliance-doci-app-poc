from flask import Flask, request, jsonify
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
