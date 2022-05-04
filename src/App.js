// import logo from './logo.svg';
// import eth from './eth.png';
import './App.css';
import Web3 from 'web3';
import {useEffect, useState} from 'react';
import lotteryContract from './lottery';
// import image from './ethereum.png';


function App() {
    const[ web3,setWeb3] = useState('');
    const[address,setAddress] = useState("");
    const[lContInstance,setLContInstance] = useState('');
    const[lotteryPot,setLotteryPot] = useState();
    const[players,setPlayers] = useState();
    const[error,setError] = useState('');
    const[lotteryWinners,setLotterywinners] = useState([]);
    const[lotteryId,setlotteryId] = useState();
    const[success,setSuccess] = useState();
    

    useEffect(()=>{
        if(lContInstance) getPot();
        if(lContInstance) getPlayers();
    },[lContInstance,address,lotteryPot,players,lotteryId]);


    const getPot = async()=>{
        const pot = await lContInstance.methods.getBalance().call();
        setLotteryPot(web3.utils.fromWei(pot, 'ether'));
    }
    const getPlayers = async()=>{
        const listplayers = await lContInstance.methods.getPlayers().call();
        setPlayers(listplayers);
    }

    const enterLottery = async() =>{
        try{
        await lContInstance.methods.enter().send({
            from: address,
            value: web3.utils.toWei('0.03', 'ether'),
            gas: 300000,
            gasPrice: null,

        })
           } catch(err){
               setError(err.message);
           }
    }

    const pickWinner =async()=>{
        try{
            await lContInstance.methods.pickWinner().send({
                from: address,
                gas: 300000,
                gasPrice: null,
    
            })
            const winnr = lotteryWinners[lotteryId-1].address;
            setSuccess(`Winner of The Ether is : ${winnr}`);
               } catch(err){
                   setError(err.message);
               }
    }

    const getWinners = async (id)=>{
        for( let i= parseInt(id); i>0; i--){                                      //parseInt() parses the string value to integer value
           const winnerAddress = await lContInstance.methods.lotteryHistory(i).call();        // here we need of lootery id to make  finite loop to prevent from infinite loop as it infinitely calls beacuse of mapping
           const winnerObj={};
           winnerObj.id = i;
           winnerObj.address = winnerAddress;
           setLotterywinners( lotteryWinners => [...lotteryWinners , winnerObj]);
        }
    }

    const getLotteryId = async()=>{
        const id = await lContInstance.methods.lotteryId().call();
        setlotteryId(id);
        await getWinners(id);
    }
    const lotWins = async()=>{
        if(lContInstance) await  getLotteryId();
        else{
            setError("Connect Wallet First");
        }
    }
    
    const connectWallet = async()=>{
        //Empty the error and success for reChecking and re entering
        setError('');
        setSuccess('');
        // Checking if there metamask present or not
        if( typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'){
           try{

               // Request Wallet Connection
              await window.ethereum.request({ method: "eth_requestAccounts"});

              //Make web3 Instance
              const web3 = new Web3(window.ethereum);

              //Set Web3 Instance
              setWeb3(web3);

              //Get the array of metamasks accounts
              const accounts = await web3.eth.getAccounts();

              //Set the Active Account
              setAddress(accounts[0]);
              console.log(address);

              //Create Local Contract Copy
              const lotteryInstance = lotteryContract(web3);

              //Set Lottery Instance
              setLContInstance(lotteryInstance);

           }catch(err){
            setError(err.message);
           }
        }
        else{
            setError("You Have Not Installed Metamask!");
        }

    }
  return (
  <>
  <div className="colo" >

    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
                    <a className="navbar-brand" href="#">W3 World </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    </button>
                    <div className="buttons">
                      <button className="btn btn-outline-info" type="submit" onClick={connectWallet}>Connect Wallet</button>
                    </div>
         </div>
    </nav>
  
    <div className="name">
    <h2>Eth Lottery Game </h2>
    <h5>Price Pool : {lotteryPot} Eth</h5>
    <p>[Check Your Luck with Web3 World]</p>
    </div>
     
        <div className="container">
           <div className="row align-items-start">
                <div className="col">
                    <div className="column is-two-thirds">
                        <section className="mt-5">
                            <p>Check your Luck by just Paying 0.01 Ether</p>
                            <button type="button" className="btn btn-outline-info" onClick={enterLottery} >Enter me</button>
                        </section>
                        <section className="mt-4">
                            <p> Picking winner  <b> (only Admin) </b></p>
                            <button type="button" className="btn btn-outline-info" onClick={pickWinner}>Luck Check</button>
                        </section>
                        <section className='text mt-3'>
                           <p> {error} </p>
                        </section>
                        <section className='twotext mt-3'>
                            <p>{success}</p>
                        </section>
                    </div>
                </div>
               
                <div className="col">
                    <section className="mt-5">
                    <div className="column is-three-third">
                    </div>
                    <section className='mt-4'>
                       <div className="container">
                       <section className="mt-4">
                            <p><b> Watch out Lottery Winners</b></p>
                            <button type="button" className="btn btn-outline-info" onClick={lotWins}>Luckers</button>
                        </section>
                             <div className=" mt-3 card">
                                 <div className="card-body">                 
                            { 
                                (lotteryWinners && lotteryWinners.length > 0) && lotteryWinners.map((win)=>{
                                    
                                     if(win.id != lotteryId) {return   <div key={ win.id}> <p>#Winner {lotteryId} </p>           
                                     <a href = {`https://etherscan.io/${win.address}`} target="_blank" rel="noreferrer">{win.address}</a> </div>
                                     }
                                   
                                })
                           }  
                                 </div>
                             </div>  
                         </div> 
                    </section >     
            </section>

                    <section className='mt-5'>
                       <div className="container">
                             <b><p>Participants in Current Lottery  </p></b>
                             <div className="card">
                                 <div className="card-body">          
                    { 
                            (players && players.length > 0) && players.map((player)=>{
                                return  <p key={player.length}>  <a href = {`https://etherscan.io/address/${player}`} target="_blank" rel="noreferrer">{player}</a> </p>                
                            })
                     }
                                 </div>
                             </div>  
                         </div>   
                     </section>
                </div>
           </div>
      </div>

      <footer className="bg-light text-center text-lg-start">
  {/* <!-- Copyright --> */}
  <div className="text-center p-3" >
    Shivang Was Here
  </div>
  {/* <!-- Copyright --> */}
</footer>
 </div>

  </>
  );
}

export default App;


