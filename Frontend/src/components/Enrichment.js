import React from "react";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './Enrichment.css';
import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Toolbar, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function Enrichment() {
    const location = useLocation();
    const navigate = useNavigate();

    const [harnessId, setHarnessId] = useState(location.state ? location.state.harnessId : "");
    const [bupId, setBupId] = useState(location.state ? location.state.bupId : "");
    const [tileId, setTileId] = useState(location.state.tileId ? location.state.tileId : "");
    const [brand, setBrand] = useState(location.state ? location.state.brand : "");
    const [idFromHarnessTable, setIdFromHarnessTable] = useState(location.state.idFromHarnessTable ? location.state.idFromHarnessTable : "");
    const [enrichments, setEnrichments] = useState([]);
    const [tiles, setTiles] = useState([]);

    useEffect(() => {
        searchData();
    }, [tileId]);

    useEffect(() => {
        setTiles(Object.keys(enrichments));
    }, [enrichments]);

    const handleHarnessChange = (event) => {
        setHarnessId(event.target.value);
        setIdFromHarnessTable("");
    }

    //manipulate data for displaying in UI and store in object
    const manipulateEnrichments = (myJson) => {

        if (idFromHarnessTable !== "") {
            myJson.filter(item => item.idFromHarnessTable === idFromHarnessTable);
        }

        const groupedByTileName = myJson.reduce((acc, obj) => {
            const key = obj.tileName;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(obj);
            return acc;
        }, {});

        // Grouping by idFromHarnessTable within each tileName group
        const groupedByBoth = {};
        for (const tileName in groupedByTileName) {
            const tileGroup = groupedByTileName[tileName];
            groupedByBoth[tileName] = tileGroup.reduce((acc, obj) => {
                const key = obj.idFromHarnessTable;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(obj);
                return acc;
            }, {});
        }

        // Output the result
        setEnrichments(groupedByBoth);
    }

    //search enrichment button functionality
    const searchData = () => {
        if (bupId !== "" && harnessId !== "") {
            let url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichmentsForUI?bupId=${bupId}&brand=${brand}&harnessId=${harnessId}`
            axios.get(url)
                .then(function (res) {
                    if (res.status === 200 && res.data) {
                        manipulateEnrichments(res.data);
                    }
                });
        }

        setEnrichments([]);
    }

    //changes on tile change
    const searchByTileId = (tileId) => {
        setIdFromHarnessTable("");
        setTileId(tileId);
    }

    //changes in bupId 
    const handleBupIdChange = (event) => {
        setBupId(event.target.value);
        setIdFromHarnessTable("");
    }

    //clear Data
    const clearData = () => {
        setBupId("");
        setHarnessId("");
        setBrand("");
        setTileId("");
        setIdFromHarnessTable("");
        setEnrichments([]);
    }

    //update data on DB on enrichment values
    const updateEnrichmentValue = async (e, data) => {
        let oldValue = "";
        let keys = Object.keys(enrichments);
        keys.map((tile) => {
            if (Array.isArray(enrichments[tile])) {
                let newArr = enrichments[tile];
                let foundElement = newArr.find(element => element.id === data.id);

                if (foundElement) {
                    oldValue = foundElement.value;
                }
            }
            return oldValue;
        })
        if (oldValue !== e.target.value && e.target.value !== "") {
            data.value = e.target.value;
            data.brand = brand;
            await axios.put(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichments/`, data)
                .then(function (res) {
                    if (res.status === 200) {
                        toast.success("Enrichment updated Successfully", {
                            position: toast.POSITION.BOTTOM_RIGHT,
                            autoClose: 1500
                        });
                    }
                });
        }
    }

    //navigate back to search screen
    const openSearch = () => {
        setIdFromHarnessTable("");
        navigate("/", { state: { brand, bupId, harnessId } });
    };

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>

                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} onClick={() => openSearch()}>
                            <span className="backBtnContainer">  <div className="backButton"><ArrowBackIosIcon />  </div>  Back to Search</span>
                        </Typography>
                    </Toolbar>
                </AppBar>
            </Box>
            
            <div>
                <br />
                <div className='searchContainer'>

                    <label> Select the Brand  <span className='asterisk'>*</span> </label>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }}>
                        <InputLabel shrink sx={{ marginTop: 30 }}></InputLabel>
                        <Select
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            style={{ height: '20px' }}
                            value={brand}
                            onChange={(e) => { setBrand(e.target.value); setBupId(""); setHarnessId(""); setIdFromHarnessTable(""); }}
                        >
                            <MenuItem value={""}>Select Brand</MenuItem>
                            <MenuItem value={"virgin"}>Virgin</MenuItem>
                            <MenuItem value={"bell"}>Bell</MenuItem>
                            <MenuItem value={"lucky"}>Lucky</MenuItem>
                        </Select>
                    </FormControl>
                    <br />


                    <label>
                        Enter your Harness id
                        <span className='asterisk'>*</span>
                    </label>
                    <TextField variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} name="harnessId" id="harnessId" value={harnessId} onChange={(e) => handleHarnessChange(e)} />
                    <br />

                    <label>
                        Enter your BUP id  <span className='asterisk'>*</span>
                    </label>
                    <TextField variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} name="bupId" id="bupId" value={bupId} onChange={(e) => handleBupIdChange(e)} />

                    <br />
                    <div className="btnContainer">
                        <Button variant="outlined" onClick={searchData} disabled={brand === "" || harnessId === "" || bupId === ""}>
                            Search
                        </Button>

                        <Button variant="outlined" onClick={clearData}>
                            Clear
                        </Button>
                    </div>

                </div>

                {tiles.length > 0 ? <div className='filterContainer'>
                    <label> Select your TileId </label>
                    <FormControl variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }}>
                        <InputLabel shrink sx={{ marginTop: 30 }}></InputLabel>
                        <Select
                            displayEmpty
                            inputProps={{ 'aria-label': 'Without label' }}
                            style={{ height: '20px', width: '450px' }}
                            label="tileId"
                            value={tileId}
                            className="tileIdSelect"
                            onChange={(e) => { searchByTileId(e.target.value); }}
                        >
                            <MenuItem value={""} >Select TileId</MenuItem>
                            {tiles.map((item) => { return <MenuItem key={item} value={item}>{item}</MenuItem> })}
                        </Select>
                    </FormControl>
                </div> : ""}

                <div className='dataContainer'>
                    {Object.keys(enrichments).length > 0 ? (tileId === "" ? (
                        tiles.map((item) => {
                            return (
                                Object.keys(enrichments[item]).map((prop) => {

                                    let enrichmentItem = enrichments[item][prop];
                                    return (
                                        enrichmentItem.map((data) => {
                                            if (!idFromHarnessTable || idFromHarnessTable === data.idFromHarnessTable) {
                                                return (<div key={data.id} className='enrichmentContainer'>
                                                    <div className='tileId'><span>{data.tileName} - {data.accountId}</span></div>
                                                    <div className='grid-container'>
                                                        <div key={data.id} className="characteristicBox">
                                                            <div className='characteristic'>{data.characteristic}</div>
                                                            <div className='characteristicValue'>
                                                                <TextField className="txtBoxCharacteristic" id={data.id} defaultValue={data.value} variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} onBlur={(e) => updateEnrichmentValue(e, data)} />
                                                            </div>
                                                            <br />
                                                        </div>
                                                    </div>
                                                </div>)
                                            }
                                        }

                                        )
                                    )
                                })
                            )
                        })
                    )
                        :
                        (Object.keys(enrichments[tileId]).map(key => {
                            let enrichmentItem = enrichments[tileId][key];
                            return (
                                <div key={key}>
                                    {enrichmentItem.map((data) => {
                                        if (!idFromHarnessTable || idFromHarnessTable === data.idFromHarnessTable) {
                                            return (
                                                <div key={data.id} className='enrichmentContainer'>
                                                    <div className='tileId'><span>{data.tileName} - {data.accountId}</span></div>
                                                    <div className='grid-container'>
                                                        <div key={data.id} className="characteristicBox">
                                                            <div className='characteristic'>{data.characteristic}</div>
                                                            <div className='characteristicValue'>
                                                                <TextField className="txtBoxCharacteristic" id={data.id} defaultValue={data.value} variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} onBlur={(e) => updateEnrichmentValue(e, data)} />
                                                            </div>
                                                            <br />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null; // Return null if condition is not met
                                    })}
                                </div>
                            );
                        }))
                    )
                        : <></>}
                    <ToastContainer />
                </div>

            </div>
        </>)
        }