import * as React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { GridToolbarContainer, GridRowModes } from '@mui/x-data-grid';
import axios from 'axios';

export default function AddData(props) {
  const { setRows, setRowModesModel, bupId, brand, harnessId } = props;
  
  // add row button on datagrid to add row and get default values
  const handleClick = () => {
    // Adding default into DB to get Id and Using ID to represent row in the table
    axios.get(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/newId?brand=${brand}&harnessId=${harnessId}&bupId=${bupId}`)
      .then(function (res) {

        setRows((oldRows) => [...oldRows, { id: res.data.id, harnessId: res.data.harnessId, bupId: res.data.bupId, isNew: true, tileId: "", tilePosition: "", targetPages: "" }]);

        setRowModesModel((oldModel) => ({
          ...oldModel,
          [res.data.id]: { mode: GridRowModes.Edit, fieldToFocus: 'bupId' },
        }));
      });
  };


  return (
    <GridToolbarContainer>
      <Button variant="text" startIcon={<AddIcon />} disabled={brand === "" || harnessId === ""} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}