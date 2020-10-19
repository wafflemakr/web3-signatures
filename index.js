window.onload = function (e) {
    const Web3 = window.Web3;
    const web3 = new Web3(window.ethereum);
    window.web3 = web3;
  
    const signBtn = document.getElementById("signBtn");
    const signBtn2 = document.getElementById("signBtn2");
    const signBtn3 = document.getElementById("signBtn3");
  
    var res = document.getElementById("response");
    var res2 = document.getElementById("response2");
    var res3 = document.getElementById("response3");
  
    let from;
  
    (async function connect() {
      await ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      from = accounts[0];
      console.log(from);
    })();
  
    // Personal Sign
    signBtn.onclick = async () => {

      const message = "Please sign this message to log in"
  
      web3.eth.personal.sign(message, from, (e, r) => {
        console.log(r);
        res.value = "Personal Signature:\n" + r;
      });
    };
  
    // eth_signTypedData
    signBtn2.onclick = async () => {
      nowTimestamp = Date.now();
  
      const message = {
        version: 3,
        nonce: nowTimestamp,
        expiration: nowTimestamp + 24 * 60 * 60 * 1000, // 24h
        msg: "Buy Order",
      };
  
      console.log("Message to sign: ", message);
  
      const msgParams = [
        { type: "uint256", name: "version", value: message.version },       
        { type: "uint256", name: "nonce", value: message.nonce },
        { type: "uint256", name: "expiration", value: message.expiration },
        { type: "string", name: "msg", value: message.msg },
      ];
  
      const params = [msgParams, from];
      const method = "eth_signTypedData";
  
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          from,
        },
        function (err, result) {
          if (err) return console.dir(err);
          if (result.error) {
            alert(result.error.message);
          }
          let sign = result.result;
          response = "EthSignTyped:\n" + sign;
          console.log(response);
          res2.value = response;
        }
      );
    };
  
    // eth_signTypedData_v3
    signBtn3.onclick = async () => {
      const domain = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
        { name: "salt", type: "bytes32" },
      ];
      const order = [
        { name: "version", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "expiration", type: "uint256" },
        { name: "msg", type: "string" },
      ];
  
      console.log("Chain ID: ", Number(web3.givenProvider.networkVersion));
  
      // Get domain data from contract called
      const domainData = {
        name: "Test",
        version: "1",
        chainId: Number(web3.givenProvider.networkVersion),
        verifyingContract: "0x7a361D11309CaC6B804F83e9b45bAeC9b34F6275",
        salt:
          "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a557",
      };
  
      nowTimestamp = Date.now();
  
      const message = {
        version: 3,
        nonce: nowTimestamp,
        expiration: nowTimestamp + 24 * 60 * 60 * 1000, // 24 h
        msg: "Buy Order",
      };
  
      const data = JSON.stringify({
        types: {
          EIP712Domain: domain,
          Order: order,
        },
        domain: domainData,
        primaryType: "Order",
        message: message,
      });
  
      // const signer = web3.utils.toChecksumAddress(from);
      const signer = from;
  
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v3",
          params: [signer, data],
          from: signer,
        },
        function (err, result) {
          if (err || result.error) {
            return console.error(result);
          }
          const signature = result.result.substring(2);
          const r = "0x" + signature.substring(0, 64);
          const s = "0x" + signature.substring(64, 128);
          const v = parseInt(signature.substring(128, 130), 16);
          console.log(`Signature: \nr:${r}\ns:${s}\nv:${v}`);
          res3.value = `EthSignTypedV3: \n0x${signature}`;
        }
      );
    };
  };