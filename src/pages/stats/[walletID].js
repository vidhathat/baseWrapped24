/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Card1 from "@/components/cards/Card1";
import Card2 from "@/components/cards/Card2";
import Card3 from "@/components/cards/Card3";
import Card4 from "@/components/cards/Card4";
import Card5 from "@/components/cards/Card5";
import Card6 from "@/components/cards/Card6";
import Card7 from "@/components/cards/Card7";
import Card8 from "@/components/cards/Card8";
import { mergeData } from "@/constants/functions";
import { app, database } from "@/constants/firebase";
import { collection, getDocs, getDoc, addDoc, setDoc, updateDoc, doc, increment } from "firebase/firestore";

import TopNav from "@/components/TopNav";
import Loading from "@/components/loading";
import Head from "next/head";
import ShareModal from "@/components/ShareModal";
import Card9 from "@/components/cards/Card9";

const Carousel = ({ address }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { walletID } = router.query;
  const [wallets, setWallets] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (walletID?.includes("+")) {
      const wallets = walletID.split("+");
      setWallets(wallets);
    } else {
      setWallets([walletID]);
    }
  }, [walletID]);

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const goToPrevSlide = () => {
    setActiveSlide(activeSlide - 1 >= 0 ? activeSlide - 1 : slides.length - 1);
  };

  const goToNextSlide = () => {
    setActiveSlide(activeSlide + 1 < slides.length ? activeSlide + 1 : 0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        goToNextSlide();
      } else if (event.key === "ArrowLeft" && activeSlide > 0) {
        goToPrevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeSlide]); //

  const fetchAndSaveData = async (wallet, balance) => {
    try {
      if (wallet?.length > 0) {
        let exists;
        const docRef = doc(database, "wallets", wallet?.toLowerCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          exists = true;
        } else {
          const docRef = doc(database, "wallets_count", "count");
          await updateDoc(docRef, {
            count: increment(1),
          });
          await setDoc(doc(database, "wallets", wallet?.toLowerCase()), {
            wallet: wallet?.toLowerCase(),
            balance: balance,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log("wallets are", wallets);
    setLoading(true);
    if (wallets.length > 0) {
      console.log("inside data");
      try {
        if (wallets.length > 1) {
          if (wallets[0] != undefined) {
            fetch(`/api/data/${wallets[0]}`)
              .then((response) => response.json())
              .then((fetchedData) => {
                if (fetchedData?.success === true) {
                  setData(fetchedData);
                  fetchAndSaveData(wallets[0], fetchedData?.balance);
                }
              })
              .catch((error) => {
                console.log(error);
              });
          }

          if (wallets[1] != undefined) {
            fetch(`/api/data/${wallets[1]}`)
              .then((response) => response.json())
              .then((fetchedData) => {
                if (fetchedData?.success === false) {
                  setError(true);
                } else {
                  fetchAndSaveData(wallets[1], fetchedData?.balance);
                  setData((prevData) => {
                    return mergeData(prevData, fetchedData);
                  });
                  setLoading(false);
                }
              })
              .catch((error) => {
                setError(true);
              });
          }
        } else {
          // get all wallets from database
          if (wallets[0] != undefined) {
            fetchAndSaveData(wallets[0]);

            fetch(`/api/data/${wallets[0]}`)
              .then((response) => response.json())
              .then((fetchedData) => {
                if (fetchedData?.success === false) {
                  setError(true);
                } else {
                  fetchAndSaveData(wallets[0], fetchedData?.balance);
                  setData(fetchedData);
                  setLoading(false);
                }
              })
              .catch((error) => {
                console.log(error);
                setError(true);
              });
          }
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setError(true);
      }
    }
  }, [wallets]);

  const slides = [
    <Card1 key={1} />,
    <Card2 total_transactions={data?.total_transactions} key={2} />,
    <Card3 transactions={data?.txn_data} key={3} />,
    <Card4 transactions={data?.txn_data} key={4} />,
    <Card5 airdrop={data?.airdrop_data} key={5} />,
    <Card6 nft={data?.nft_data} key={6} />,
    <Card9 nft={data?.nft_data} key={9} />,
    <Card7 transactions={data?.txn_data} key={7} />,
    <Card8 data={data} key={8} activeSlide={activeSlide} slideLen={9} />,
  ];
  //  console.log('txs', data.txn_data)
  const Loading = () => {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  };
  return (
    <div className="min-h-screen p-8 bg-black relative">
      <Head>
        <title>Your Solana Wallet Wrapped - 2023</title>
        <meta
          name="description"
          content="Where Solana wallet users get a deep dive into their top transactional moments of the year."
        />
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="Your Solana Wallet Wrapped - 2023" />
        <meta
          property="og:description"
          content="Where Solana wallet users get a deep dive into their top transactional moments of the year."
        />
        <meta
          property="og:image"
          content="https://i.ibb.co/X5SwdM7/Solana-Wrapped-Preview.png"
        />
        <meta property="og:url" content="https://www.solanawrapped.xyz/" />
        <meta
          name="twitter:title"
          content="Your Solana Wallet Wrapped - 2023"
        />
        <meta
          name="twitter:description"
          content="Where Solana wallet users get a deep dive into their top transactional moments of the year."
        />
        <meta
          name="twitter:image"
          content="https://i.ibb.co/X5SwdM7/Solana-Wrapped-Preview.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <TopNav />
      {error ? (
        <div className="flex flex-col gap-4 justify-center items-center h-screen">
          <img
            src="https://c.tenor.com/r3_j0eBORREAAAAC/tenor.gif"
            alt="error"
            className="w-[50%] h-1/4 md:h-1/3 rounded-xl"
          />
          <h1 className="text-white text-2xl">OOPS! something went wrong</h1>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loading />
        </div>
      ) : (
        <div>
          <div className="w-[80%] md:w-[55%] mx-auto flex justify-center mt-[20%] md:mt-20 mb-4">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 w-5 rounded-full md:w-16 mx-1 ${
                  index <= activeSlide ? "bg-green-500" : "bg-dark-blue"
                }`}
              ></div>
            ))}
          </div>
          <div className="flex justify-around">
            <div
              className=" flex justify-between mx-auto"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {activeSlide !== 0 && (
                <button
                  onClick={goToPrevSlide}
                  style={{ marginLeft: "35%" }}
                  className={`flex sm:hidden cursor-pointer bg-[#252B35] rounded-full shadow-md z-[2] p-1 m-0 absolute
                  ${
                    activeSlide === slides.length - 1
                      ? "bottom-[2%]"
                      : "bottom-[10%]"
                  }
                   left-2 ${activeSlide === 0 ? "opacity-0" : "opacity-100"}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M16.3594 17.2812L11.5885 12.5L16.3594 7.71875L14.8906 6.25L8.64062 12.5L14.8906 18.75L16.3594 17.2812Z"
                      fill="white"
                    />
                  </svg>
                </button>
              )}
              {/* {
      activeSlide !== 0 && ( */}
              {/* main button left */}
              <div>
                {activeSlide === 0 ? (
                  ""
                ) : (
                  <button
                    onClick={goToPrevSlide}
                    style={{
                      top: "50%",
                    }}
                    className={`hidden sm:flex absolute cursor-pointer bg-[#252B35] rounded-full h-12 w-12 shadow-md items-center justify-center ${
                      activeSlide === 0 ? "hidden" : "flex"
                    }
                    ${
                      activeSlide === slides.length - 1
                        ? "left-[14%]"
                        : "left-[24%]"
                    }
                    `}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M16.3594 17.2812L11.5885 12.5L16.3594 7.71875L14.8906 6.25L8.64062 12.5L14.8906 18.75L16.3594 17.2812Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                )}
                {activeSlide === slides.length - 1 ? (
                  ""
                ) : (
                  <button
                    onClick={goToNextSlide}
                    style={{
                      top: "50%",
                    }}
                    className={`hidden sm:flex absolute cursor-pointer bg-[#252B35] rounded-full h-12 w-12 shadow-md items-center justify-center ${
                      activeSlide === slides.length - 1 ? "hidden" : "flex"
                    } right-[24%]`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M8.64062 7.71875L13.4115 12.5L8.64062 17.2813L10.1094 18.75L16.3594 12.5L10.1094 6.25L8.64062 7.71875Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                )}
                {slides.map((Slide, index) => (
                  <div
                    key={index}
                    className={`absolute w-[80%] ${
                      activeSlide === slides.length - 1
                        ? "h-[62%] md:w-[50%]"
                        : "h-[55%] md:w-[40%]"
                    }   
                         md:h-[60%] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                           index === activeSlide
                             ? "opacity-100 z-10"
                             : "opacity-0 z-1"
                         }`}
                  >
                    {Slide}
                  </div>
                ))}
              </div>
              {activeSlide < slides.length - 1 && (
                <div>
                  <button
                    onClick={goToNextSlide}
                    style={{ marginRight: "40%" }}
                    className={`flex sm:hidden cursor-pointer bg-[#252B35] z-[20] rounded-full md:mt-64 z-1 shadow-md p-1 m-0 absolute 
                    ${
                      activeSlide === slides.length - 1
                        ? "bottom-[2%]"
                        : "bottom-[10%]"
                    } right-2`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25"
                      height="25"
                      viewBox="0 0 25 25"
                      fill="none"
                    >
                      <path
                        d="M8.64062 7.71875L13.4115 12.5L8.64062 17.2813L10.1094 18.75L16.3594 12.5L10.1094 6.25L8.64062 7.71875Z"
                        fill="white"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            {isOpen && <ShareModal handleClose={handleClose} />}

            {activeSlide < slides.length - 1 && (
              <div className="hidden md:fixed bottom-[50px] md:right-3 md:flex justify-between items-center">
                <div className="relative inline-flex rounded-full group">
                  <div className="absolute transition-all duration-500 opacity-0 -inset-px bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] rounded-full blur-lg group-hover:opacity-40 group-hover:-inset-1 group-hover:duration-200 animate-tilt"></div>
                  <a
                    href="#"
                    onClick={() => setIsOpen(true)}
                    className="relative bg-gray inline-flex items-center justify-center text-sm px-8 py-4 text-white transition-all duration-200 bg-gray-900 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 group-hover:bg-white group-hover:text-black"
                    role="button"
                  >
                    Share Solana Wrapped
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;
