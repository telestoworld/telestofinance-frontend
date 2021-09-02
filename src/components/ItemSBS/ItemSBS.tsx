import React, {useRef} from "react"
import styled from "styled-components";
import Logo from "../../assets/img/tomb_ftm_lp.png"
import HiddenAccordion from "../HiddenAccordion/HiddenAccordion";

export interface ItemCardProps {
    item : {
        id: number;
        tittle: string;
        uses: string;
        wallet: number;
        deposited: number;
        apy: string;
        daily: string;
        tvl: string
    }
}
 
const ItemSBS: React.SFC<ItemCardProps> = ({item}) => {

    const hidden : React.MutableRefObject<HTMLDivElement | null> = useRef(null)

    const openMoreInfo = () : void =>{
        if(hidden.current.classList.contains("show")){
            hidden.current.classList.replace("show", "hidden")
        }else{
            hidden.current.classList.replace("hidden", "show")
        }
    }

    return ( 
        <Container >
            <ClosedCard onClick={openMoreInfo} >
            <Img src={Logo} alt="logo" />
            <MainInfo>
                <div className="first-half">
                    <h2>{item.tittle}</h2>
                    <p>uses : {item.uses}</p>
                </div>
                <div className="second-half">
                    <button type="button">buy token</button>
                    <button type="button">add liquidity</button>
                </div>
            </MainInfo>
            <div className="wallet-deposited-box">
            <InfoBox>
                <h3>{item.wallet}</h3>
                <p>wallet</p>
            </InfoBox>
            <InfoBox>
                <h3>{item.deposited}</h3>
                <p>deposited</p>
            </InfoBox>
            </div>
            <InfoBox>
                <h3>{item.apy}</h3>
                <p>APY</p>
            </InfoBox>
            <InfoBox>
                <h3>{item.daily}</h3>
                <p>daily</p>
            </InfoBox>
            <InfoBox>
                <h3>${item.tvl}</h3>
                <p>TVL</p>
            </InfoBox>
            </ClosedCard>
            <HiddenAccordion hidden={hidden} tittle={item.tittle}/>
        </Container>
     );
}
 
//main container
const Container = styled.div`
    background-color : #fff;
    padding : 1.5rem 1rem 0 1rem;
    border-radius: 5px;
    margin-bottom: 1rem;
    .hidden-info{
        display: flex;
        border-top : 1px solid rgba(184, 183, 183, .5);
        transition: height .5s ease;
        overflow: hidden;
    }
    .hidden{
        height: 0;
    }
    .show{
        height : 23rem;
        padding : 1.5rem 0 0 0;
        @media (max-width : 768px){
        flex-direction: column;
        align-items: center;
        height: 40rem;
        }
    }
`
//initial card
const ClosedCard = styled.div`
    display: grid;
    align-content: center;
    grid-template-columns: 5% 20% 30% repeat(3, 15%);
    padding-bottom: 1.5rem;
    cursor : pointer;
    @media (max-width : 768px){
        grid-template-columns: repeat(3, 1fr);
        grid-row-gap: 1rem;
    }
    .wallet-deposited-box{
        display: flex;
        justify-content: space-around;
        @media (max-width : 768px){
        grid-column: 1/4;
        justify-content: space-around;
        }
    }
`

const Img = styled.img`
    width: 3.2rem;
    height : auto;
    @media (max-width : 768px){
        display: none;
    }
`

const MainInfo = styled.div`
    text-align: start;
    padding-left : 2rem;
    @media (max-width : 768px){
        grid-column: 1 / 4;
        padding-left : 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .first-half{
        display: flex;
        flex-direction: column;
        h2{
        margin: 0 0 .25rem 0;
        text-transform: uppercase;
        font-size : 1rem;
        }
        p{
            margin: 0;
            color : gray;
            text-transform : capitalize;
            font-size: .8rem;
            @media (max-width : 768px){
            margin: .5rem 0;
        }
        }
    }
    .second-half{
        display : flex;
        @media (max-width : 768px){
        width: 65%;
        justify-content: space-between;
    }
        button{
            border: none;
            background: none;
            cursor: pointer;
            text-align: start;
            padding: 0;
            text-transform : capitalize;
            font-weight: 700;
            &:first-child{
                margin-right : auto;
            }
        }
    }
`

const InfoBox = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    h3{
        font-weight: bold;
        margin: 0;
        font-size: 1.1rem;
    }
    p{
        margin: 0;
        color : gray;
        font-size: .9rem;
        text-transform : capitalize;
    }
`

export default ItemSBS;