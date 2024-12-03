import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import {
  GridRowModes,
  DataGrid, GridRowEditStopReasons, GridActionsCellItem
} from '@mui/x-data-grid';
import axios from 'axios';
import AddData from './AddData'
import './NewHarness.css';
import { Autocomplete, Chip, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import CancelIcon from '@mui/icons-material/Close';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


export default function NewHarness(props) {
  const navigate = useNavigate();
  const { bupId, brand, harnessId } = props;

  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = React.useState({});
  const [tilesOptions, setTileOptions] = useState([]);
  const [channels] = useState(["", "eCare", "mCare"]);
  const [tilePositions, setTilePositions] = useState([]);
  const [targetPages, setTargetPages] = useState([]);

  const [page, setPage] = useState(1);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    setRows(props.rows);
  }, [props]);

  useEffect(() => {
    if (brand !== "") {
      getTargetPages(brand);
      getTiles(brand);
      getTilePosition();
    }
    setRows([]);
  }, [brand])

  // get values for tiles dropdown
  const getTiles = async (brand) => {
    let url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/getTiles?type=` + brand;
    await axios.get(url)
      .then(function (res) {
        if (res.data.length > 0) {
          const tilePairs = res.data;
          const valueOptions = tilePairs.map((element) => (
            {
              label: element.name,
              value: element.tileId
            }
          ));
          setTileOptions([{ label: "Select TileId", value: "" }, ...valueOptions]);

        }
      });

  }

  // get values for targetPage dropdown
  const getTargetPages = (brand) => {
    axios.get(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/targetPages?type=` + brand)
      .then(function (res) {
        if (res.data.length > 0) {
          const targetPages = res.data;

          const valueOptions = targetPages.map((element) => (
            {
              label: element.name,
              value: element.name
            }
          ));
          setTargetPages([...valueOptions]);

        }
      });
  }

  // get values for target position dropdown
  const getTilePosition = () => {
    axios.get(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/tilePosition`)
      .then(function (res) {
        if (res.data.length > 0) {
          const tilePositions = res.data;

          const valueOptions = tilePositions.map((element) => (
            {
              label: element.name,
              value: element.name
            }
          ));
          setTilePositions([{ label: "Select Tile Position", value: "" }, ...valueOptions]);

        }
      });
  }

  //save record into DB
  const saveRecord = (updatedRecord) => {
    updatedRecord.accountId = updatedRecord.accountId === undefined || updatedRecord.accountId === "" ? "N/A" : updatedRecord.accountId;
    updatedRecord.serviceId = updatedRecord.serviceId === undefined || updatedRecord.serviceId === "" ? "N/A" : updatedRecord.serviceId;
    updatedRecord.brand = brand;
    updatedRecord.harnessId = updatedRecord.harnessId || "";


    if (updatedRecord.isNew) {
      // we will be updating to blank record added to table
      axios.put(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness/`, updatedRecord)
        .then(function (res) {
          if (res.status === 200) {
            toast.success("Harness Record Added Successfully", {
              position: toast.POSITION.BOTTOM_RIGHT,
              autoClose: 1500
            });
            if (res.data && res.data.enrichment) {
              // we will be adding enrichment data only if enrichment is true 
              axios.post(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichments?brand=${brand}`, [res.data])
                .then(function (resEnrich) {
                  if (resEnrich.status === 200) {
                    toast.success("Enrichment Record Added Successfully", {
                      position: toast.POSITION.BOTTOM_RIGHT,
                      autoClose: 1500
                    });
                  }
                });
            }
            setRows(rows.map((row) => (row.id === updatedRecord.id ? res.data : row)));
            // setRowModesModel((oldModel) => ({
            //   ...oldModel,
            //   [updatedRecord.id]: { mode: GridRowModes.View, fieldToFocus: 'bupId' },
            // }));
          }
        });

      // adding new data 
      // let oldId = updatedRecord.id;
      // delete updatedRecord["id"];
      // axios.post(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness?brand=${brand}${harnessId !== undefined || harnessId !== "" ? `&harnessId=${harnessId}` : ""}`, [updatedRecord])
      //   .then(function (res) {
      //     if (res.data) {
      //       const updatedRow = { ...res.data[0] };
      //       toast.success("Harness Record Added Successfully", {
      //         position: toast.POSITION.BOTTOM_RIGHT,
      //         autoClose: 1500
      //       });
      //        let newRows = rows.map((row) => (row.id === oldId ? updatedRow : row));
      //       setRows(newRows);
      //       if(res.data.length > 0) {
      //         axios.post(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichments?brand=${brand}`, res.data)
      //           .then(function (resEnrich) {
      //             if (resEnrich.status === 200) {
      //               toast.success("Enrichment Record Added Successfully", {
      //                 position: toast.POSITION.BOTTOM_RIGHT,
      //                 autoClose: 1500
      //               });
      //             }
      //           });
      //       }

      //       // setRowModesModel((oldModel) => ({
      //       //   ...oldModel,
      //       //   [updatedRow.id]: { mode: GridRowModes.View, fieldToFocus: 'bupId' },
      //       // }));
      //     }
      //   });
    } else {
      //updating new Data
      axios.put(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness/`, updatedRecord)
        .then(function (res) {
          if (res.status === 200) {
            toast.success("Harness Record Updated Successfully", {
              position: toast.POSITION.BOTTOM_RIGHT,
              autoClose: 1500
            });

            if (res.data) {
              axios.put(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichmentUpdate/`, updatedRecord)
                .then(function (response) {
                  if (response.status === 200) {
                    toast.success("Enrichment Record Updated Successfully", {
                      position: toast.POSITION.BOTTOM_RIGHT,
                      autoClose: 1500
                    });
                    // setRows(rows.map((row) => (row.id === updatedRecord.id ? res.data : row)));
                  }
                });
            }
            setRows(rows.map((row) => (row.id === updatedRecord.id ? res.data : row)));
            // setRowModesModel((oldModel) => ({
            //   ...oldModel,
            //   [updatedRecord.id]: { mode: GridRowModes.View, fieldToFocus: 'bupId' },
            // }));
          }
        });
    }
  };

  const processRowUpdate = (newRow, oldRow) => {
    const updatedRow = { ...newRow, oldBupId: oldRow.bupId };
    if (checkMandatoryFields(newRow)) {
      saveRecord(updatedRow);
    } else {
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [newRow.id]: { mode: GridRowModes.Edit, fieldToFocus: 'bupId' },
      }));
    }

    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop = (params, event) => {

    if ((params.reason === GridRowEditStopReasons.rowFocusOut || params.reason === GridRowEditStopReasons.enterKeyDown) && checkMandatoryFields(params.row)) {
      event.defaultMuiPrevented = false;
    } else {
      event.defaultMuiPrevented = true;
    }
  };

  // get value for dropdown values for selecttion depending on type- tileposition, tiles
  const getSelectedItem = (type, option) => {
    const item = type.find((opt) => {
      if (opt.value === option) {
        return opt;
      }
    })
    return item || {};
  }

  //get value from all targetpages for selection
  const getSelectedTargetPages = (values) => {
    const item = targetPages.filter((opt) => {
      return values.indexOf(opt.value) >= 0
    })
    return item || [];
  }

  const handleDeleteClick = (id) => () => {
    let url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness/?id=${id}&brand=` + brand;
    axios.delete(url, { "Access-Control-Allow-Origin": `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_PORT}` })
      .then(function (res) {
        if (res.status === 200 && res.statusText === "OK") {
          toast.success("Harness Record Deleted Successfully", {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 1500
          });

          if (res.data.harnessId !== "" && res.data.enrichment) {
            let enrichmentUrl = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/enrichments/?idFromHarnessTable=${id}&harnessId=${res.data.harnessId}&brand=${brand}&tileId=${res.data.tileId}&bupId=${res.data.bupId}`;

            axios.delete(enrichmentUrl, { "Access-Control-Allow-Origin": `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_PORT}` })
              .then(function (resEnrich) {
                if (resEnrich.status === 200 && resEnrich.statusText === "OK") {
                  toast.success("Enrichment Record Deleted Successfully", {
                    position: toast.POSITION.BOTTOM_RIGHT,
                    autoClose: 1500
                  });

                }
              });
          }
          setRows(rows.filter((row) => row.id !== id));
        }
      });
  };

  const handleCancelClick = (id, isNew) => () => {
    if (isNew) {
      // will remove blank record added on Addrow button click from DB 
      let url = `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/harness/?id=${id}&brand=` + brand;
      axios.delete(url, { "Access-Control-Allow-Origin": `http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_PORT}` })
        .then(function (res) {
          if (res.status === 200 && res.statusText === "OK") {
            // setRowModesModel({
            //   ...rowModesModel,
            //   [id]: { mode: GridRowModes.View, ignoreModifications: true },
            // });

            const editedRow = rows.find((row) => row.id === id);
            if (editedRow.isNew) {
              setRows(rows.filter((row) => row.id !== id));
            }
          }
        });
    } else {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });

      const editedRow = rows.find((row) => row.id === id);
      if (editedRow.isNew) {
        setRows(rows.filter((row) => row.id !== id));
      }
    }
  };

  const handleOnCellClick = async (params) => {
    if (params.field === "enrichment") {
      let reqBody = { "brand": brand, "harnessId": params.row.harnessId, "bupId": params.row.bupId }
      await axios.post(`http://${process.env.REACT_APP_ENV}:${process.env.REACT_APP_EXPRESS_BACKEND_PORT}/api/tiles/refreshEnrichments`, reqBody)
        .then(function (res) {
          if (res.status === 200 && res.data.message === "refresh done") {
            navigate("/enrichment", { state: { idFromHarnessTable: params.id, brand, bupId: params.row.bupId, tileId: params.row.tileName, harnessId: params.row.harnessId } });
          }
        });
    } else if (params.field !== "actions") {
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [params.row.id]: { mode: GridRowModes.Edit, fieldToFocus: params.field },
      }));
    }
  };

  const handleOnCellKeyDown = (params, event) => {
    if (event.key === "Tab" && params.field === "bupId") {
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [params.row.id]: { mode: GridRowModes.Edit, fieldToFocus: "tileId" },
      }));
    }
  };

  const handleRowUpdateError = (error) => {
    console.log("error", error);
  };

  //check required fields before saving
  const checkMandatoryFields = (data) => {
    return data.bupId !== "" && data.tileId !== "" && data.channel !== "" && data.channel !== null && data.targetPages !== "{}" && data.tilePosition !== "";

  }

  //column definition for datagrid
  const columns = [
    {
      field: 'harnessId', headerClassName: 'dataGridHeader', editable: false, display: 'text', flex: 1,
      renderHeader: () => (
        <span>
          Harness Id
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
    },
    {
      field: 'bupId', headerName: '', headerClassName: 'dataGridHeader', editable: true, display: 'text', flex: 1,
      renderHeader: () => (
        <span>
          BUP Id
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
      preProcessEditCellProps: ({ id, row, props }) => {
        row.bupId = props.value;
        const updatedRows = [...rows];
        let index = updatedRows.findIndex((rowItem) => rowItem.id === id);
        updatedRows[index] = row;
        return { ...props, rows: updatedRows };
      },
    },
    {
      field: 'channel',
      class: "channel",
      editable: true,
      type: 'singleSelect',
      headerClassName: 'dataGridHeader',
      valueOptions: channels,
      flex: 1,
      preProcessEditCellProps: ({ id, row, props }) => {
        row.channel = props.value === null ? "" : props.value;
        const updatedRows = [...rows];
        let index = updatedRows.findIndex((rowItem) => rowItem.id === id);
        updatedRows[index] = row;
        return { ...props, rows: updatedRows };
      },
      renderHeader: () => (
        <span>
          Channel
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
    },
    {
      field: 'tileId',
      headerClassName: 'dataGridHeader',
      display: 'flex',
      flex: 2.5,
      renderHeader: () => (
        <span>
          Tile Name
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
      renderCell: (params) => (
        <Autocomplete
          options={tilesOptions}
          getOptionLabel={(option) => option.label}
          value={getSelectedItem(tilesOptions, params.row.tileId)}
          renderInput={(params) => (
            <TextField {...params} />
          )}
          disableClearable
          renderOption={(props, option) => (
            <li {...props} style={{ fontSize: '10px' }}>
              {option.label}
            </li>
          )}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            const updatedRows = [...rows];
            const updatedRow = { ...params.row, [params.field]: newValue.value || '', "tileName": newValue.label || '', oldTileId: params.row.tileId };
            let index = updatedRows.findIndex((rowItem) => rowItem.id === params.id);
            updatedRows[index] = updatedRow;

            setRowModesModel((oldModel) => ({
              ...oldModel,
              [params.id]: { mode: GridRowModes.Edit, fieldToFocus: 'bupId' },
            }));
            params.api.setRows(updatedRows);
          }}
        />
      ),
    },
    {
      field: 'targetPages',
      align: 'left',
      headerAlign: 'left',
      headerClassName: 'dataGridHeader',
      display: 'flex',
      flex: 3,
      renderHeader: () => (
        <span>
          Target Page
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
      renderCell: (params) => (
        <Autocomplete
          multiple
          options={targetPages}
          freeSolo
          getOptionLabel={(option) => option.label}
          value={getSelectedTargetPages(params.row.targetPages)}
          renderInput={(params) => (
            <TextField {...params} />
          )}
          disableClearable
          renderTags={(tagValue, getTagProps) => {
            return tagValue.map((option, index) => (
              <Chip {...getTagProps({ index })} label={option.label} size="small" sx={{
                height: '15px',
                fontSize: '10px',
              }} />
            ));
          }}
          //isOptionEqualToValue={(option, value) => option.value === value.value && params.row.targetPages.indexOf(option.value) >= 0 }
          onChange={(event, newValue) => {
            const updatedRows = [...rows];
            const updatedRow = { ...params.row, "targetPages": newValue !== undefined ? newValue.map((val) => { return val.value }) : JSON.stringify([""]) };
            let index = updatedRows.findIndex((rowItem) => rowItem.id === params.id);
            updatedRows[index] = updatedRow;
            setRowModesModel((oldModel) => ({
              ...oldModel,
              [params.id]: { mode: GridRowModes.Edit, fieldToFocus: 'bupId' },
            }));
            params.api.setRows(updatedRows);
          }}
        // onKeyDown={(event) => {
        //   if (event.key === 'Enter' && params.row.bupId !== "") {
        //     event.defaultPrevented = true;
        //     saveRecord({ ...params.row })
        //   }
        // }}
        />
      ),
    },
    {
      field: 'tilePosition',
      align: 'left',
      headerAlign: 'left',
      headerClassName: 'dataGridHeader',
      display: 'flex',
      flex: 1.5,
      renderHeader: () => (
        <span>
          Tile Position
          <span className='mandatory'>
            *
          </span>
        </span>
      ),
      renderCell: (params) => (
        <Autocomplete
          options={tilePositions}
          getOptionLabel={(option) => option.label}
          value={getSelectedItem(tilePositions, params.row.tilePosition)}
          renderInput={(params) => (
            <TextField {...params} />
          )}
          disableClearable
          isOptionEqualToValue={(option, value) => option.value === value.value}
          onChange={(event, newValue) => {
            const updatedRows = [...rows];
            const updatedRow = { ...params.row, [params.field]: newValue.value || '' };
            let index = updatedRows.findIndex((rowItem) => rowItem.id === params.id);
            updatedRows[index] = updatedRow;

            setRowModesModel((oldModel) => ({
              ...oldModel,
              [params.id]: { mode: GridRowModes.Edit, fieldToFocus: 'bupId' },
            }));
            params.api.setRows(updatedRows);
          }}
        />
      ),
    },
    {
      field: 'serviceId',
      headerName: 'Service Id',
      headerClassName: 'dataGridHeader',
      editable: true,
      display: 'text',
      flex: 1,
      preProcessEditCellProps: ({ id, row, props }) => {
        row.serviceId = props.value;
        const updatedRows = [...rows];
        let index = updatedRows.findIndex((rowItem) => rowItem.id === id);
        updatedRows[index] = row;
        return { ...props, rows: updatedRows };
      },
    },
    {
      field: 'accountId',
      headerName: 'Account Id',
      headerClassName: 'dataGridHeader',
      editable: true,
      display: 'text',
      flex: 1,
      preProcessEditCellProps: ({ id, field, row, props }) => {
        row.accountId = props.value;
        const updatedRows = [...rows];
        let index = updatedRows.findIndex((rowItem) => rowItem.id === id);
        updatedRows[index] = row;
        return { ...props, rows: updatedRows };
      },
    },
    {
      field: 'enrichment',
      headerName: 'Enrichment',
      editable: false,
      type: 'singleSelect',
      headerClassName: 'dataGridHeader',
      flex: 0.75,
      renderCell: (params) => (
        <button
          style={{ borderRadius: '5px' }}
          className="btnContainer"
          disabled={!params.row.enrichment}
        // onClick={() => { navigate("/enrichment", { state: { idFromHarnessTable: params.id, brand, bupId: params.row.bupId, tileId: params.row.tileName } }) }
        // }
        > Go
        </button>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      cellClassName: 'actions',
      headerClassName: 'dataGridHeader',
      flex: 0.75,
      getActions: (params) => {
        const isInEditMode = rowModesModel[params.id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(params.id, params.row.isNew)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(params.id)}
            color="inherit"
          />,
        ];
      },
    }
  ];

  return (
    <Box
      sx={{
        height: '120vh',
        '& .MuiDataGrid-root .MuiDataGrid-columnHeader, .MuiDataGrid-root .MuiDataGrid-cell': {
          padding: '0px'
        },
        '& .MuiDataGrid-cellContent': {
          marginLeft: '10px',
        },
        '& .MuiDataGrid-columnHeaderTitleContainer': {
          marginLeft: '10px',
        },
        '& .MuiDataGrid-row .MuiDataGrid-row--editable .MuiDataGrid-row--editing .MuiDataGrid-row--lastVisible': {
          backgroundColor: 'grey',
          fontSize: '16px'
        },
        '& .MuiOutlinedInput-root':
        {
          fontSize: '10px'
        },
        '& .MuiAutocomplete-root': {
          cursor: 'pointer',
          display: 'flex',
          width: "100%"
        },
        '& .MuiDataGrid-selectedRowCount ':
        {
          visibility: "hidden"
        }
      }}
      className="boxContainer"
    >
      <DataGrid
        rows={rows}
        columns={columns}
        disableAutosize={false}
        disableColumnResize={false}
        getRowHeight={() => 'auto'}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={handleRowUpdateError}
        onCellClick={handleOnCellClick}
        onCellKeyDown={handleOnCellKeyDown}
        slots={{
          toolbar: AddData,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, bupId, brand, harnessId },
        }}
        page={page}
        pagination
        rowCount={rows.length}
        onPageChange={handlePageChange}
      />
      <ToastContainer />
    </Box>
  )
};
