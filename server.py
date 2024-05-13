from flask import Flask, jsonify, request
import subprocess
import webbrowser
from flask_cors import CORS
import nbformat
from nbformat.v4 import new_notebook, new_code_cell
import nbconvert
from nbconvert.preprocessors import ExecutePreprocessor
import base64
import os
import json



app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.join(os.path.expanduser('~'), 'Documents', 'notebooks')
notebook_path = os.path.join(BASE_DIR, 'saved_code.ipynb')
        
# Check if the directory exists, if not, create it
os.makedirs(BASE_DIR, exist_ok=True)


@app.route('/analyze-data', methods=['GET'])
def analyze_data():
    notebook_path = "C:/Users/AjayYadav/analysis.ipynb"
    py_script_path = "C:/Users/AjayYadav/analysis.py"

    # Convert notebook to Python script
    result = subprocess.run(['jupyter', 'nbconvert', '--to', 'script', notebook_path], capture_output=True, text=True)
    if result.returncode == 0:
        # Execute the Python script
        result = subprocess.run(['python', py_script_path], capture_output=True, text=True)
        print(result)
        if result.returncode == 0:
            # Read the analysis result from subprocess output
            analysis_result = result.stdout
            # Return the analysis result in the response
            return jsonify({'result': analysis_result})
        else:
            # Handle error condition
            error=result.stderr
            # return jsonify({'error': 'Failed to execute Python script'})
            return jsonify({'result': error})

    else:
        # Handle error condition
        return jsonify({'error': 'Failed to convert notebook to Python script'})



# @app.route('/process-python-code', methods=['POST'])
# def process_python_code():
#     data = request.get_json()
#     code = data['code']
    
#     try:
#         # Write the received code to a temporary Python file
#         # with open('C:/Users/AjayYadav/temp_code.py', 'w') as f:
#         #     f.write(code)
        
#         # Run the Python code
#         # output = subprocess.check_output(['python', 'C:/Users/AjayYadav/temp_code.py'], universal_newlines=True)
#         output = subprocess.check_output(['python', '-c',code], universal_newlines=True)
#         # Remove the temporary Python file
#         # subprocess.run(['rm', 'temp_code.py'])
        
#         return jsonify({'output': output})
#     except Exception as e:
#         return jsonify({'error': str(e)})

@app.route('/process-python-code', methods=['POST'])
def process_python_code():
    data = request.get_json()
    code = data['code']
    file_path = os.path.join(BASE_DIR,'output.json' )
    try:
        result = subprocess.run(['python','-c',code], capture_output=True, text=True)
        print(result)
        if result.returncode == 0:
            # Read the analysis result from subprocess output
            analysis_result = result.stdout

            with open(file_path, 'r') as f:
               json_data = json.load(f)

            # Return the analysis result in the response
            return jsonify({'output': analysis_result,'data':json_data})
        else:
            # Handle error condition
            error=result.stderr
            # return jsonify({'error': 'Failed to execute Python script'})
            return jsonify({'output': error})
    except Exception as e:
        return jsonify({'error': str(e)})



@app.route('/save-code', methods=['POST'])
def save_code():
    data = request.get_json()
    code = data['code']
    
    # Here you can save the code as an .ipynb file using appropriate libraries
    # you can use nbformat to create an .ipynb file
    nb = new_notebook()
    nb.cells.append(new_code_cell(code))
    
    with open(notebook_path, 'w') as f:
        nbformat.write(nb, f)
    
    return jsonify({'message': 'Code saved as .ipynb file'})

@app.route('/send-code', methods=['GET'])
def send_code():
    try:
      converted_code = convert_to_python(notebook_path)
      return jsonify({'convertedCode': converted_code})
    except Exception as e:
        return jsonify({'error': str(e)})

def convert_to_python(file_path):
    try:
        # Convert notebook to Python code
        exporter = nbconvert.PythonExporter()
        exporter.exclude_input_prompt = True
        exporter.exclude_output_prompt = True
        exporter.pre_code = True
        with open(file_path, 'r') as f:
            notebook = nbformat.read(f, as_version=4)
            body, _ = exporter.from_notebook_node(notebook)
            return body
    except Exception as e:
        return str(e)

@app.route('/openNotebook', methods=['POST'])
def openNotebook():
    data = request.get_json()
    code = data['code']
    try:
        # Check if the notebook file exists
        if not os.path.isfile(notebook_path):
            # If the file doesn't exist, create an empty notebook file
            notebook = new_notebook()
            # notebook_content = nbformat.writes(notebook)
            notebook.cells.append(new_code_cell(code))
            with open(notebook_path, 'w') as f:
                nbformat.write(notebook, f)
            p=subprocess.Popen(['jupyter', 'notebook', notebook_path])
            return jsonify({'result':'The file is not present. It has been created and opened.'})
        else:
            p=subprocess.Popen(['jupyter', 'notebook',notebook_path])
            return jsonify({'result':'The file is present and opened'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500   
    
@app.route('/upload', methods=['POST'])
def upload():
    # Check if the POST request contains files
    if 'files' not in request.files:
        return jsonify({'error': 'No files found in the request'}), 400

    files = request.files.getlist('files')
    file_paths = []

    for file in files:
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file:
            file_path = os.path.join(BASE_DIR, file.filename)
            file.save(file_path)
            file_paths.append({"path":file_path,"fileName":file.filename})

    return jsonify({'filePaths': file_paths})

@app.route('/folderPath',methods=['GET'])
def folderPath():
    return jsonify({'folderPath':BASE_DIR})

if __name__ == '__main__':
    app.run(debug=True)