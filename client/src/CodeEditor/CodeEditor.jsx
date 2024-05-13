import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CodeEditor.css";
import MultiFileUploader from "../FileUploader/MultiFileUploader";
import SpreadSheet from "../SpreadSheet/SpreadSheet";
import { IoCloseCircle } from "react-icons/io5";
import { source } from "./source";

const CodeEditor = () => {
  const [code, setCode] = useState("");
  const [defaultCode, setDefaultCode] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFolderPath, setOutputFolderPath] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [instruction, setInstruction] = useState("");
  const [spreadsheetLoader, setSpreadsheetLoader] = useState(false);
  const [aiLoader, setAILoader] = useState(false);

  const [spreadSheetData, setSpreadSheetData] = useState([]);
  const [show, setShow] = useState(true);

  const handleChange = (e) => {
    setCode(e.target.value);
  };

  const sendCodeToServer = () => {
    axios
      .post("http://localhost:5000/save-code", { code })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error sending code to server:", error);
      });
  };

  const recieveCodeFromServer = async () => {
    try {
      const response = await axios.get("http://localhost:5000/send-code");
      setCode(response.data.convertedCode);
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  const fetchDataAnalysis = async () => {
    setSpreadsheetLoader(true);
    axios
      .post("http://localhost:5000/process-python-code", { code })
      .then((response) => {
        console.log(response.data);
        setSpreadSheetData(response.data.data);
        setAnalysisResult(response.data.output);
      })
      .catch((error) => {
        console.error("Error sending code to server:", error);
      });
    setSpreadsheetLoader(false);
  };

  const OpenNotebook = async () => {
    try {
      const response = await axios.post("http://localhost:5000/openNotebook", {
        code,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
  };

  const get_sheet_indexes = (instruction) => {
    var sheets = instruction
      .split(" ")
      .filter((word) => word.toLocaleLowerCase().includes("sheet"));

    var sheets_index = sheets.map((sheet) => {
      var index = +sheet.match(/[^0-9]+|\d+/g)[1] - 1;
      return index;
    });

    console.log(sheets_index);
    return sheets_index;
  };

  const genAi = () => {
    setAILoader(true);
    var updated_instruction =
      ` You have a file with path ${selectedFiles[0].path}` +
      instruction +
      `Save the updated df as json and orient records at file path ${outputFolderPath}.`;

    const options = {
      method: "POST",
      url: "https://api.edenai.run/v2/text/code_generation",
      headers: {
        authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiN2RjZTMxOWYtZmM3ZS00MDY4LWE3MjYtNjdkNDMzNjk0NjJhIiwidHlwZSI6ImFwaV90b2tlbiJ9.VontNv6deTpuF1eFbxXXooeN3w26HxN5TL67O5crRL8",
      },
      data: {
        providers: "openai",
        prompt: "",
        instruction: updated_instruction,
        temperature: 0.1,
        max_tokens: 500,
        fallback_providers: "",
      },
    };

    axios
      .request(options)
      .then((response) => {
        var generated_code =
          response.data.openai.generated_text.split("```")[1];
        var required_code = generated_code.slice(6);
        setCode(defaultCode + required_code);
      })
      .catch((error) => {
        console.error(error);
      });
    // console.log(`You have a file with path ${}.` + instruction);
    // get_sheet_indexes(instruction);

    // setInstruction("");
    setAILoader(false);
  };

  const handleInstruction = (e) => {
    setInstruction(e.target.value);
  };

  const handleFilePaths = (filePaths) => {
    setSelectedFiles(filePaths);
    // let rawCode = "import pandas as pd\n\n";
    // filePaths.forEach((file, index) => {
    //   rawCode += `df${index} = pd.read_excel(r'${file.path}')\n`;
    // });
    // return filePaths;
    // setCode(defaultCode + rawCode);
  };

  const closeHandler = () => {
    setShow(false);
  };

  useEffect(() => {
    const fetchFolderPath = async () => {
      try {
        const response = await axios.get("http://localhost:5000/folderPath");
        const folderPath = response.data.folderPath;
        const rawCode = `#To save the result and see on worksheet, Uncomment any of the line.\n#df.to_csv(r'${folderPath}\\output.csv', index=False)\n#df.to_excel(r'${folderPath}\\output.xlsx', index=False)\n#df.to_json(r'${folderPath}\\output.json', orient='records')\n\n`;

        setOutputFolderPath(`${folderPath}\\output.json`);
        setCode(rawCode);
        setDefaultCode(rawCode);
      } catch (error) {
        console.error("Error fetching analysis:", error);
      }
    };
    fetchFolderPath();
    setSpreadSheetData(source);
  }, []);
  return (
    <div className="container">
      <div className="spreadsheet">
        <SpreadSheet
          data={spreadSheetData}
          spreadsheetLoader={spreadsheetLoader}
        />
      </div>
      <div
        className="codebox"
        style={show ? { display: "block" } : { display: "none" }}
      >
        <button onClick={OpenNotebook}>Open Notebook</button>
        <button onClick={fetchDataAnalysis}>Perform Data Analysis</button>
        <button onClick={sendCodeToServer}>Save</button>
        <button onClick={recieveCodeFromServer}>Reload</button>
        <button className="close-icon" onClick={closeHandler}>
          <IoCloseCircle size={30} />
        </button>
        <div className="code-editor">
          <div className="code-editor__textarea">
            <MultiFileUploader handleFilePaths={handleFilePaths} />
            <textarea
              className="textarea"
              value={code}
              onChange={handleChange}
            />
            <div className="input-container">
              <input
                placeholder="Type your instruction here"
                value={instruction}
                onChange={handleInstruction}
              />
              <button onClick={genAi}>
                {aiLoader ? "Loading.." : "GenAi"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
