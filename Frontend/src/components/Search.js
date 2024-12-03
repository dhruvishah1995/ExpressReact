import { useState } from 'react';
import axios from 'axios';
import './Search.css';
// import HarnessData from './HarnessData';
import NewHarness from './NewHarness';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Toolbar, Typography } from '@mui/material';
import './Search.css';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [bupId, setBupId] = useState(location.state ? location.state.bupId : "");
  const [harnessId, setHarnessId] = useState(location.state ? location.state.harnessId : "");

  const [harness, setHarness] = useState([]);
  const [brand, setBrand] = useState(location.state ? location.state.brand : "");

  // search button functionality
  const searchData = () => {
    if (brand !== "") {
      axios.get(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness${brand !== "" ? `?brand=${brand}` : ""}${harnessId !== "" ? `&harnessId=${harnessId}` : ""}${bupId !== "" ? `&bupId=${bupId}` : ""}`)
        .then(function (res) {
          if (res.data.length > 0) {
            setHarness(res.data);
          }
        });
    }
    setHarness([]);
  }

  const handleBupIdChange = (event) => {
    setBupId(event.target.value);
  }

  const handleHarnessIdChange = (event) => {
    setHarnessId(event.target.value);
  }

  const clearData = () => {
    setHarness([]);
    setBupId("");
    setHarnessId("");
    setHarnessId("");
    setBrand("");
  }

  // go enrichment navigation button 
  const openEnrichment = async () => {
    let reqBody = { "brand": brand, "harnessId": harnessId, "bupId": bupId }
    await axios.post(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/refreshEnrichments`, reqBody)
      .then(function (res) {
        if (res.status === 200 && res.data.message === "refresh done") {
          navigate("/enrichment", { state: { brand, bupId, harnessId } });
        }
      });
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 2 }}>

            </Typography>
            <Typography variant="h6" component="div" onClick={() => openEnrichment()} style={{ 'textTransform': 'none' }}>
              <span className="frwdBtnContainer"> Go Enrichment <div className="frwdButton"> <ArrowForwardIosIcon />  </div></span>
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
      <div>
        <label>Select the Brand
          <span className='asterisk'>*</span>
        </label>

        <FormControl variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }}>
          <InputLabel shrink sx={{ marginTop: 30 }}></InputLabel>
          <Select
            displayEmpty
            inputProps={{ 'aria-label': 'Without label' }}
            style={{ height: '20px' }}
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setBupId(""); setHarness([]); }}
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
        </label>
        <TextField variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} name="harnessId" id="harnessId" value={harnessId} onChange={(e) => handleHarnessIdChange(e)} />
        <br />

        <label>
          Enter your BUP id
        </label>
        <TextField variant="standard" sx={{ m: 1, minWidth: 200, height: 20 }} name="bupId" id="bupId" value={bupId} onChange={(e) => handleBupIdChange(e)} />

        <div className='btnContainer'>
          <Button variant="outlined" onClick={searchData} disabled={brand === ""}>
            Search
          </Button>

          <Button variant="outlined" onClick={clearData}>
            Clear
          </Button>
        </div>

        <div>
          <NewHarness rows={harness} bupId={bupId} brand={brand} harnessId={harnessId} />
        </div>
      </div>

    </>
  )

}