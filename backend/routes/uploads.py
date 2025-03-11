import datetime
import os
from flask import jsonify, request, send_from_directory
from flask_jwt_extended import jwt_required
from backend.app import app
from utils.file_util import allowed_file
from extensions.logger import logger
from werkzeug.utils import secure_filename


@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        logger.info("Starting file upload process")
        logger.info(f"Request files: {request.files}")
        logger.info(f"Request headers: {dict(request.headers)}")
        
        if 'file' not in request.files:
            logger.error("No file part in request")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error("No selected file")
            return jsonify({'error': 'No selected file'}), 400
        
        if not allowed_file(file.filename):
            logger.error(f"Invalid file type: {file.filename}")
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Generate secure filename
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        
        # Save file
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        logger.info(f"Saving file to: {file_path}")
        file.save(file_path)
        
        # Generate URL
        file_url = f'/static/uploads/{filename}'
        logger.info(f"File saved successfully. URL: {file_url}")
        
        return jsonify({
            'url': file_url,
            'filename': filename
        })
    
    except Exception as e:
        logger.error(f"Error in upload_file: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/static/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)