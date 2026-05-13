from flask import Flask, request, Response, jsonify
import requests
import base64

app = Flask(__name__)
API_SECRET = 'KT670n4yoAl3FSIicyM6UUZfyPHKcWWX'

@app.route('/api/convert', methods=['POST'])
def convert_document():
    # 1. Validasi File
    if 'file' not in request.files:
        return jsonify({"error": "File tidak ditemukan dalam request"}), 400
        
    file = request.files['file']
    source_format = request.form.get('source_format', '').lower()
    target_format = request.form.get('target_format', '').lower()
    
    url = f"https://v2.convertapi.com/convert/{source_format}/to/{target_format}?Secret={API_SECRET}"
    
    # 2. Baca file ke memory (Bypass Hard Drive)
    file_bytes = file.read()
    files = {
        'File': (file.filename, file_bytes)
    }
    
    try:
        # 3. Request ke API Eksternal
        response = requests.post(url, files=files, timeout=600)
        
        if response.status_code == 200:
            data = response.json()
            
            # API mengembalikan string Base64, kita convert balik menjadi bytes biner
            file_b64 = data['Files'][0]['FileData']
            output_bytes = base64.b64decode(file_b64)
            
            # 4. Kirim file biner langsung ke Frontend
            return Response(
                output_bytes,
                mimetype="application/octet-stream",
                headers={
                    "Content-Disposition": f"attachment;filename=converted.{target_format}"
                }
            )
        else:
            # Jika API memberikan error
            err_msg = response.json().get('Message', 'Error dari server backend')
            return jsonify({"error": err_msg}), response.status_code
            
    except requests.exceptions.ReadTimeout:
        return jsonify({"error": "Waktu proses (Timeout) habis. File terlalu besar."}), 504
    except Exception as e:
        return jsonify({"error": f"Kesalahan Sistem: {str(e)}"}), 500

# Wajib agar dikenali oleh Vercel Serverless
def handler(request, response):
    return app(request, response)