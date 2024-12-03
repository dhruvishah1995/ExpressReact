import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Select, Toolbar, Typography } from "@mui/material";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as xlsx from 'xlsx';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import './FeedDB.css';
import axios from "axios";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
export default function FeedDB() {

    const [dbTable, setDbTable] = useState("");
    const [jsonData, setJsonData] = useState([]);
    const [fileName, setFileName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    //upload file to convert to JSON
    const readUploadFile = (e) => {
        e.preventDefault();
        
        if (e.target.files) {
            setFileName(e.target.files[0].name);
            let extension = e.target.files[0].name.split(".")[1];
            const reader = new FileReader();

            if (extension === "xlsx" || extension === "xls" || extension === "csv") {
                setErrorMessage("");

                reader.onload = (e) => {
                    const data = e.target.result;

                    const workbook = xlsx.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = xlsx.utils.sheet_to_json(worksheet);
                    setJsonData(json);
                };
                reader.readAsArrayBuffer(e.target.files[0]);

            } else if (extension === "json") {
                setErrorMessage("");
                reader.readAsText(e.target.files[0], "UTF-8");
                reader.onload = e => {
                    let data = JSON.parse(e.target.result);
                    setJsonData(data);
                };
            } else {
                setErrorMessage("Please upload excel or json file.");
                setJsonData([]);
            }

        }
    };

    //clear button functionality
    const clearForm = () => {
        setDbTable("");
        setJsonData([]);
        setFileName("");
    };

    // push converted JSON data to Database
    const feedDB = async () => {

        let url;

        if (dbTable === "targetPages") {
            url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/targetPagesRefreshFromExcel`;
        } else if (dbTable === "tilePosition") {
            url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/tilePositionRefreshFromExcel`;
        }

        await axios.post(url, jsonData)
            .then(function (res) {
                if (res.status === 200) {
                    toast.success("Enrichment updated Successfully", {
                        position: toast.POSITION.BOTTOM_RIGHT,
                        autoClose: 1500
                    });
                }
            });
    };

    return (
        <div>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 2 }}>

                        </Typography>
                        <Typography variant="h6" component="div" style={{ 'textTransform': 'none' }}>
                            Upload Excel to Add Data to Database
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            <br />

            <div>
                <label> Select the DB Table
                    <span className='asterisk'>*</span>
                </label>

                <FormControl variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }}>
                    <InputLabel shrink sx={{ marginTop: 30 }}></InputLabel>
                    <Select
                        displayEmpty
                        inputProps={{ 'aria-label': 'Without label' }}
                        style={{ height: '20px' }}
                        value={dbTable}
                        onChange={(e) => { setDbTable(e.target.value); }}
                    >
                        <MenuItem value={""}>Select Database Table </MenuItem>
                        <MenuItem value={"tilePosition"}>Tile Position</MenuItem>
                        <MenuItem value={"targetPages"}>Target Pages</MenuItem>
                    </Select>
                </FormControl>
                <br />
    
                <div className="uploadFile">
                    <span>
                        <Button
                            component="label"
                            variant="outlined"
                            tabIndex={-1}
                            startIcon={<CloudUploadIcon />}
                            onChange={readUploadFile}
                        >
                            Choose File
                            <VisuallyHiddenInput type="file" />

                        </Button>
                        {fileName !== "" ? <div> {fileName} </div> : ''}
                    </span>
                    <br />
                    {errorMessage !== "" ? <div className="asterisk"> {errorMessage} </div> : ''}
                </div>

                <div className='btnContainer'>
                    <Button variant="outlined" onClick={feedDB} disabled={dbTable === "" || jsonData.length < 0 || errorMessage !== ""}>
                        Add to Database
                    </Button>

                    <Button variant="outlined" onClick={clearForm}>
                        Clear
                    </Button>
                </div>

                <div style={{ marginLeft: '15px' }}>
                    <p> Please make sure items on the below json Array matches the columns in the Database. The data in the table will be replaced and not updated. Please make sure to take backup of your data before proceeding to add this data.</p>
                </div>

                {jsonData.length > 0 ? <div className="previewData">
                    <label> Previewing Data </label>
                    <pre>{JSON.stringify(jsonData, null, 2)}</pre>
                </div> : ""}

            </div>

            <ToastContainer />
        </div>
    );

}