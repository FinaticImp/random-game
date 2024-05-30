import {
  ConnectButton,
  useCurrentAccount,
  useSuiClientQuery,
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { TypeAnimation } from "react-type-animation";
import { DEVNET_COUNTER_PACKAGE_ID, ROLES } from "../../config/constants";

import { useNavigate } from "react-router-dom";
import "./index.less";

const typeTextStyle = {
  whiteSpace: "pre-line",
  height: "30px",
  display: "inline-block",
  fontSize: 13,
  color: "white",
  paddingTop: 10,
  paddingLeft: 10,
};
const Splash = () => {
  const [showLoading, setShowLoading] = useState(false);
  const navigate = useNavigate();
  const client = useSuiClient();
  let counterPackageId = DEVNET_COUNTER_PACKAGE_ID;

  const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();

  useEffect(() => {
    // 随机生成角色
    const randomIndex = Math.floor(Math.random() * 6) + 1
    const role = ROLES[randomIndex - 1]
    localStorage.setItem('role', JSON.stringify(role))
  }, [])

  function StartGameBtnWrapper() {
    const account = useCurrentAccount();

    if (!account) {
      return null;
    }

    return (
      <div>
        <div
          className="startGameBtn w-[280px] m-auto p-2 border border-white text-center"
          onClick={handleInitGame}
        >
          开始游戏
        </div>
        {showLoading && firstLoadTextWrapper()}
      </div>
    );
  }

  function handleInitGame() {
    const txb = new TransactionBlock();
    setShowLoading(true);

    txb.moveCall({
      arguments: [
        txb.object("0x8"), // r: &Random
      ],
      target: `${counterPackageId}::randomX::rollDice`,
    });

    signAndExecute(
      {
        transactionBlock: txb,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      },
      {
        onSuccess: (tx) => {
          client
            .waitForTransactionBlock({
              digest: tx.digest,
            })
            .then(() => {
              const objectId = tx.effects?.created?.[0]?.reference?.objectId;
              localStorage.setItem("gameId", objectId + "");

              navigate("/home");
            });
        },
        onError: (e) => {
          console.error(e);
        },
      }
    );
  }

  const firstLoadTextWrapper = () => {
    return (
      <TypeAnimation
        style={typeTextStyle}
        omitDeletionAnimation={true}
        speed={40}
        sequence={[`打开Sui钱包 确认交易...`, 5000, `即将进入，请等待...`]}
      />
    );
  };
  return (
    <div className="startPage w-full h-screen py-6">
      {/* <div className="absolute top-[20px] m-auto"> */}
      <img src='/assets/title.png' className="w-[300px] m-auto mb-10" />
      {/* <div className="description">
        这种方法确保了在用户交互后音频才会播放，符合现代浏览器的自动播放策略。您可以根据需要添加更多的控制，例如暂停、停止、调整音量等。
        这种方法确保了在用户交互后音频才会播放，符合现代浏览器的自动播放策略。您可以根据需要添加更多的控制，例如暂停、停止、调整音量等。
      </div> */}
      {/* <img src="/assets/start-border.png" className="w-[60%] m-auto mb-10" /> */}
      <div className="w-[300px] m-auto ">

      <div className=" pb-4 flex justify-center align-middle">
        <p className=" pt-3 text-lg">玩家：</p>
        <ConnectButton connectText="连接 Sui钱包" />
      </div>
      <StartGameBtnWrapper />
      </div>

      <audio src="/assets/music/into.mp3" autoPlay loop />
    </div>
  );
};

export default Splash;
