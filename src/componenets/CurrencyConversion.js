import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import "./styles/currencyConversion.css";
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { Grid } from '@mui/material';


const base_url = process.env.REACT_APP_BASE_URL;


export default function CurrencyConversion() {

    const [value, setValue] = React.useState(dayjs().format('YYYY/MM/DD'));


    const [sourceCur, setSource] = useState("USD");
    const [targetCur, setTarget] = useState("INR");
    const [currList, setCurrList] = useState([]);

    const [srcInputVal, setSrcInputVal] = useState();
    const [tarInputVal, setTarInputVal] = useState();

    const [debouncedInputValue, setDebouncedInputValue] = useState("");

    const handleSourceDropdownSelection = (e) => {

        setSource(e.target.value);
    }

    const handleTargetDropdownSelction = (e) => {

        setTarget(e.target.value);

    }

    const handleSrcInputVal = (e) => {
        setSrcInputVal(e.target.value);
    }

    const handleTarInputVal = (e) => {
        setTarInputVal(e.target.value);
    }

    useEffect(() => {
        const delayInputTimeoutId = setTimeout(() => {
            setDebouncedInputValue(srcInputVal);
        }, 500);
        return () => clearTimeout(delayInputTimeoutId);
    }, [srcInputVal]);


    const fetchCurrList = async (url) => {
        if (currList.length) {
            return
        }
        try {

            const res = await fetch(`${base_url}/codes`);
            let data = await res.json();

            let currListDataArr = data.supported_codes;

            setCurrList(currListDataArr);


        } catch (error) {
            return

        }
    }

    useEffect(() => {
        fetchCurrList();
    }, []);


    const fetchDataForPairConversion = async (url) => {

        try {
            const res = await fetch(`${base_url}/pair/${sourceCur}/${targetCur}`);

            let data = await res.json();
            if (!res.ok) {
                return
            }

            let conversionRate = data.conversion_rate;
            if (srcInputVal) {
                let converted_amt = srcInputVal * conversionRate;
                setTarInputVal(converted_amt);
            }


        } catch (error) {

            return

        }

    };

    useEffect(() => {
        if (srcInputVal) {
            fetchDataForPairConversion();

            if (value === dayjs().format('YYYY/MM/DD')) {
                fetchDataForPairConversion();

            } else {
                fetchDataForSelectedDate();
            }
        } else {
            setTarInputVal(0);

        }

    }, [debouncedInputValue, value, targetCur, sourceCur]);



    const handleDate = (inputDate) => {
        setValue(dayjs(inputDate.$d).format('YYYY/MM/DD'));

    }


    const fetchDataForSelectedDate = async (url) => {
        try {

            let [year, month, day] = value.split("/");


            const res = await fetch(`${base_url}/history/${sourceCur}/${year}/${month}/${day}`);

            const data = await res.json();
            if (!res.ok) {

                alert('No data available for this date in the database.');
                setValue(dayjs().format('YYYY/MM/DD'))
                return

            }

            let conversionRate = data.conversion_rates;

            // if the src currency is available in the conversion_rates obj and input is present 
            if (targetCur in conversionRate && srcInputVal) {
                let conversionRateForSrcCurr = conversionRate[targetCur];

                let converted_amt = srcInputVal * conversionRateForSrcCurr;
                setTarInputVal(converted_amt);


            }

        } catch (error) {
            return
        }
    }


    return (

        <div className="currency-conversion-layout">

            <div className='header'>Currency Converter</div>

            <div className='converterWrapper'>

                <Box
                    className='currency-container'
                    component="form"
                    sx={{
                         '& .MuiTextField-root': { m: 1, width: '25ch' },
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <div>
                   

                        {/* for source currency */}
                        <TextField
                            className='source-field'
                            id="outlined-select-currency"
                            sx={{ backgroundColor: '#A7C7E7' }}
                            select
                            label="Source"
                            defaultValue="USD"
                            helperText=""
                            value={sourceCur || ""}
                            onChange={handleSourceDropdownSelection}

                        >
                            {currList.map((option) => (
                                <MenuItem key={option[0]} value={option[0]} className='src-menu'>
                                    <div className='src-textfield'>
                                        <span className='src-option1'> {option[0]} </span>
                                        <span className='src-option2'> {option[1]} </span>
                                    </div>
                                </MenuItem>
                            ))}
                        </TextField>


                        <SyncAltIcon sx={{ viewBox: "0 0 24 24" }} className='arrow-icon' />
                    

                        {/* for target currency */}
                     
                        <TextField
                            className='target-field'
                            id="outlined-select-currency"
                            sx={{ backgroundColor: '#A7C7E7' }}
                            select
                            label="Target"
                            defaultValue="EUR"
                            helperText=""
                            value={targetCur || ""}
                            onChange={handleTargetDropdownSelction}
                        >
                            {currList.map((option) =>
                            (

                                <MenuItem key={option[0]} value={option[0]} className='tar-menu'>
                                    <div className='tar-textfield'>
                                        <span className='tar-option1'> {option[0]} </span>
                                        <span className='tar-option2'> {option[1]} </span>
                                    </div>

                                </MenuItem>
                            )
                            )}
                        </TextField>
                        
                    </div>
                  

                </Box>

                {/* input section */}

                <Box
                    className='input-container'
                    component="form"
                    sx={{
                        '& > :not(style)': { width: '50ch', display: "flex", flexWrap: "nowrap", gap: 2, mb: 6, mt: 3, ml: 1 },
                    }}
                >
                    <div className='input-textfields'>

                        <TextField className="input-textfield" type="number" id="standard-basic" label="" variant="standard" value={srcInputVal || ""} onChange={handleSrcInputVal} />

                        <TextField className="output-textfield" disabled id="standard-basic" label="" variant="standard" value={tarInputVal || ""} onChange={handleTarInputVal} />

                    </div>
                </Box>

                {/* date picker section */}
                <div className="date-picker-container">

                <LocalizationProvider dateAdapter={AdapterDayjs}  
               
                >


                    <DatePicker
                        sx={{ backgroundColor: '#A7C7E7' }}
                        label="Select Date"
                        value={dayjs(value)}
                        format='YYYY/MM/DD'
                        onChange={(newValue) => handleDate(newValue)}
                        disableFuture
                    />

                </LocalizationProvider>

            </div>
            </div>

        </div>

    );

}







