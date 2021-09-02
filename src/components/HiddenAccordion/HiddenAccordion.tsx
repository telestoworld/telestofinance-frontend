import React from "react"
import styled from "styled-components";
import { Slider } from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';

export interface HiddenProps {
    hidden : React.MutableRefObject<HTMLDivElement> | null
    tittle : string 
}

const marks = [
    {
      value: 0,
      label: '0%',
    },
    {
      value: 25,
      label: '25%',
    },
    {
      value: 50,
      label: '50%',
    },
    {
      value: 75,
      label: '75%',
    },
    {
      value: 100,
      label: '100%',
    },
];

const muiTheme = createMuiTheme({
    overrides:{
      MuiSlider: {
        thumb:{
            color: "#571eb1",
        },
        track: {
          color: '#571eb1'
        },
        rail: {
          color: 'black'
        }
      }
  }
  });
 
const HiddenAccordion: React.SFC<HiddenProps> = ({hidden, tittle}) => {
    function valuetext(value: any) {
        return `${value}%`;
    }

    function valueLabelFormat(value: any) {
        return marks.findIndex((mark) => mark.value === value) + 1;
    }

    return ( 
        <div className="hidden-info hidden" ref={hidden}>
                <ContainerOpen>
                <h3>Balance: <span>0 {tittle}</span></h3>
                <InputBox>
                    <h4>0.0</h4>
                    <select>
                        <option>{tittle}</option>
                        <option>{tittle}</option>
                        <option>{tittle}</option>
                    </select>
                </InputBox>
                <ProgressBox>
                {/* <progress value="1" max="100">1%</progress>
                <div>
                    <p>0%</p>
                    <p>25%</p>
                    <p>50%</p>
                    <p>75%</p>
                    <p>100%</p>
                </div> */}
                <ThemeProvider  theme={muiTheme}>
                    <Slider
                        defaultValue={0}
                        getAriaValueText={valuetext}
                        aria-labelledby="discrete-slider-custom"
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        marks={marks}
                    />
                </ThemeProvider >
                </ProgressBox>
                
                <button type="button">approve</button>
                <h5>Desposit fee: 0.0%, Withdrawal fee: 0.1%</h5>
                <p>You will recieve miniTSHLP as a receipt for your deposited TSHARE-FTM LP Pool access. this token is needed to withdraw your TSHARE-FTM LP, do not trade or transfer miniTSHLP to strangers!</p>
            </ContainerOpen>
            <ContainerOpen>
                <h3>Deposited: <span>0.0000000 {tittle}</span></h3>
                <InputBox>
                    <h4>0.0</h4>
                    <select>
                        <option>{tittle}</option>
                        <option>{tittle}</option>
                        <option>{tittle}</option>
                    </select>
                </InputBox>
                <ProgressBox>
                <ThemeProvider  theme={muiTheme}>
                    <Slider
                        defaultValue={0}
                        getAriaValueText={valuetext}
                        aria-labelledby="discrete-slider-custom"
                        step={5}
                        min={0}
                        max={100}
                        valueLabelDisplay="auto"
                        marks={marks}
                    />
                </ThemeProvider >
                {/* <progress value="1" max="100">1%</progress>
                <div>
                    <p>0%</p>
                    <p>25%</p>
                    <p>50%</p>
                    <p>75%</p>
                    <p>100%</p>
                </div> */}
                </ProgressBox>
                <div className="btn-box">
                <button type="button" className="second-btn" >withdraw</button>
                <button type="button" className="second-btn" >withdraw all</button>
                </div>
            </ContainerOpen>
        </div>
     );
}
 
const ContainerOpen = styled.div`
    display: flex;
    flex-direction: column;
    align-items : center;
    padding: 0 1rem;
    width: 50%;
    @media (max-width : 768px){
        width: 100%;
        &:last-child{
            margin-top: 2rem;
        }
    }
    h3{
        color: rgba(184, 183, 183, 1);
        align-self: flex-start;
        margin: 0 0 1rem 2.5%;
        font-size : 1rem;
        span{
            text-decoration: dashed;
        }
        @media (max-width : 768px){
             align-self: unset;
            }
    }
    button{
        margin: 1.5rem 0 1rem 0;
        text-transform: uppercase;
        font-weight: 900;
        color: #fff;
        background-color: #000;
        border : 1px solid #000;
        border-radius: 7.5px;
        padding: 1rem 0;
        width: 10rem;
        cursor : pointer;
        transition : background .3s ease, color .3s ease;
        &:hover{
            background: none;
            color : #000
        }
        @media (max-width : 768px){
             width: 7.5rem;
             font-size: .7rem;
        }
    }
    .second-btn{
        margin-right: 1rem;
        background: none;
        color : #000;
        &:hover{
            background: #000;
            color : #fff
        };
        &:last-child{
            margin-right: 0;
        }
    }
    h5{
        font-size: .9rem;
        color : gray;
        margin : 0.5rem 0 1rem 0
    }
    p{
        margin: 0;
        color : gray;
        font-size: .8rem;
        text-align: center;
    }
`

const InputBox = styled.div`
    display : flex;
    border: 2px solid rgba(184, 183, 183, .5);
    border-radius: 10px;
    padding: .75rem;
    width: 90%;
    justify-content: space-between;
    h4{
        font-weight : 300;
    };
    select{
        background: none;
        border: none;
        border-left: 2px solid rgb(184, 183, 183);;
        font-size: .9rem;
        text-transform : uppercase;
        padding-left: .5rem;
        font-weight: 500;
        outline: none;
    }
`
const ProgressBox = styled.div`
    width: 95%;
    margin-top: .5rem;
    progress{
        width: 100%;
        height: .4rem;
    }
    div{
        display : flex;
        justify-content: space-between;
        p{
            margin: 0;
            color : #000
        }
    }
`
export default HiddenAccordion;