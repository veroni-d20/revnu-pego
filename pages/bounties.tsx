import Head from "next/head";
import ApplicationLayout from "@/components/Utilities/ApplicationLayout";
import DEPLOYED_CONTRACTS from "@/utilities/contractDetails";
import { useState, useEffect } from "react";
import { useContractRead, useContractWrite } from "wagmi";
import axios from "axios";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatEther } from "viem";

export default function Bounties() {
  const [bounties, setBounties] = useState<any>([]);

  //get last bounty ID

  const {
    data: lastBountyId,
    isError,
    isLoading,
    isSuccess,
  }: any = useContractRead({
    address: DEPLOYED_CONTRACTS.REVNU_REGISTRY.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_REGISTRY.abi,
    functionName: "getLatestBountyId",
  });

  const range: any = (n: number) =>
    Array.from(Array(n).keys()).map((n) => n + 1);

  useEffect(() => {
    if (lastBountyId) {
      let bounties = range(parseInt(lastBountyId));
      setBounties(bounties);
    }
  }, [lastBountyId]);

  return (
    <>
      <Head>
        <title>
          Dashboard - Revnu | Like, Comment & Subscribe to earn Pego tokens
        </title>
      </Head>

      <ApplicationLayout
        customHeader="Bounties"
        // customHeaderDescription="Here's a list of all recent proposals created on the Electra
        //     DAO."
      >
        {parseInt(lastBountyId) != 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-5 gap-y-5">
            {bounties.map((bounty: number[], index: number) => (
              <BountyCard bountyId={bounty} key={index} />
            ))}
          </div>
        ) : (
          <Link
            href={"create-bounty"}
            className="bg-zinc-100 relative block w-full mt-2 rounded-lg border-2 border-dashed border-gray-500 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              className="w-full h-10 opacity-60 text-primary-600"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>

            <span className="mt-2 block text-sm font-semibold text-gray-600">
              Create a new bounty
            </span>
          </Link>
        )}
      </ApplicationLayout>
    </>
  );
}

function BountyCard({ bountyId, key }: any) {
  const [verificationError, setVerificationError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Uh oh! Something went wrong. Please try again."
  );

  // get bounty data

  const {
    data: bounty,
    isError,
    isLoading,
    isSuccess,
  }: any = useContractRead({
    address: DEPLOYED_CONTRACTS.REVNU_REGISTRY.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_REGISTRY.abi,
    functionName: "bountyRegistry",
    args: [bountyId],
  });

  // claim bounty function

  const {
    data: claimData,
    isError: isClaimError,
    isLoading: isClaimLoading,
    isSuccess: isClaimSuccess,
    error,
    write: claimBounty,
  }: any = useContractWrite({
    address: DEPLOYED_CONTRACTS.REVNU_REGISTRY.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_REGISTRY.abi,
    functionName: "claimBounty",
  });

  useEffect(() => {
    if (isClaimError) {
      let claimErrorMessage: any = error;
      claimErrorMessage = claimErrorMessage?.message;

      if (claimErrorMessage.includes("Bounty already claimed by user")) {
        setErrorMessage("Bounty already claimed by user");
      }
    }
  }, [isClaimError, error]);

  async function handleVerification(
    actionLink: string,
    actionType: string,
    verifiedBountyId: number
  ) {
    let myArray = actionLink.split("//");
    let actionId = myArray[1].split("/").slice(-1)[0];
    const accessToken = localStorage.getItem("token");
    const apikey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

    switch (actionType) {
      case "like":
        let videoId = actionId.split("=")[1];

        try {
          // GET request to fetch the user's rating (like) for the video
          const ratingResponse = await axios.get(
            "https://www.googleapis.com/youtube/v3/videos/getRating",
            {
              params: {
                key: apikey,
                id: videoId,
                access_token: accessToken,
              },
            }
          );
          const userRating = ratingResponse.data.items[0];

          if (userRating) {
            if (userRating.rating === "like") {
              claimBounty({
                args: [verifiedBountyId],
              });
            } else {
              setVerificationError(true);
              setErrorMessage("You have not rated the video.");
            }
          } else {
            setVerificationError(true);
            setErrorMessage("User rating information not found");
          }
        } catch (error: any) {
          console.error("Error:", error.message);
        }
        break;

      case "subscribe":
        const subcribersResponse = await axios.get(
          "https://www.googleapis.com/youtube/v3/subscriptions",
          {
            params: {
              key: apikey,
              part: "snippet",
              forChannelId: actionId,
              mine: true,
              access_token: accessToken,
              maxResults: 6,
            },
          }
        );
        if (subcribersResponse.data.items[0] != undefined) {
          const subscribedChannelId =
            subcribersResponse.data.items[0].snippet.resourceId.channelId;
          if (subscribedChannelId == actionId) {
            claimBounty({
              args: [verifiedBountyId],
            });
          }
        } else {
          setVerificationError(true);
          setErrorMessage("You have not subscribed");
        }
        break;

      case "comment":
        try {
          let videoId = actionId.split("=")[1];

          const channelRespose = await axios.get(
            "https://www.googleapis.com/youtube/v3/channels",
            {
              params: {
                key: apikey,
                part: "snippet",
                mine: true, // Get the channel for the authenticated user
                access_token: accessToken,
              },
            }
          );

          if (channelRespose.data.items != undefined) {
            const channel = channelRespose.data.items[0];

            if (channel) {
              const apiUrl =
                "https://www.googleapis.com/youtube/v3/commentThreads";

              // Make a GET request to fetch comment threads for the video
              axios
                .get(apiUrl, {
                  params: {
                    key: apikey,
                    part: "snippet",
                    videoId: videoId,
                    access_token: accessToken,
                  },
                })
                .then((response) => {
                  // Handle the API response here
                  const commentThreads = response.data.items;

                  if (commentThreads) {
                    // Check if the authenticated user's comment is among the comment threads
                    const userHasCommented = commentThreads.some(
                      (thread: any) => {
                        if (thread.snippet.topLevelComment) {
                          const commentUserId =
                            thread.snippet.topLevelComment.snippet
                              .authorChannelId.value;

                          // Optionally, you can check if the comment was made by the authenticated user
                          if (channel.id && commentUserId === channel.id) {
                            return true;
                          }
                        }
                        return false;
                      }
                    );

                    if (userHasCommented) {
                      claimBounty({
                        args: [verifiedBountyId],
                      });
                    } else {
                      setVerificationError(true);
                      setErrorMessage("You have not commented on the video");
                    }
                  } else {
                    setVerificationError(true);
                    setErrorMessage("No comment threads found for the video");
                  }
                })
                .catch((error) => {
                  // Handle errors
                  console.error("Error fetching comment threads:", error);
                });
            } else {
              setVerificationError(true);
              setErrorMessage("Your channel is not found");
            }
          } else {
            setVerificationError(true);
            setErrorMessage("Your channel is not found");
          }
        } catch (error) {
          console.log(error);
        }

        break;
      default:
        break;
    }
  }

  return isLoading ? (
    "Loading"
  ) : (
    <div key={key} className="bg-white border border-gray-200 rounded-md">
      <div className="px-5 sm:px-6 lg:px-8 pt-5 font-black text-xl">
        Bounty #{bounty[0].toString()}
      </div>

      {/* Votes Progress Bar Start */}
      <div className="mt-5 px-5 sm:px-6">
        <p className="mt-1 text-md leading-5 font-bold flex justify-between">
          <span className="text-zinc-700">Action Claims</span>
          <span className="">
            {bounty[5].toString()} out of {bounty[4].toString()}
          </span>
        </p>
        <div className="mt-3 w-full bg-zinc-200 rounded-full h-1">
          <div
            className="bg-green-600 h-1 rounded-full"
            style={{
              width: `${
                (parseFloat(bounty[5]) / parseFloat(bounty[4])) * 100
              }%`,
            }}
          ></div>
        </div>
      </div>
      {/* Votes Progress Bar End */}
      {/* Addresses Start */}
      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <table className="min-w-full divide-y divide-gray-300">
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                Bounty Creator
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                {bounty[1].toString()}
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                Action ID
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm underline text-gray-900 text-right">
                <Link href={bounty[2].toString()}>{bounty[2].toString()}</Link>
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                Action Type
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                {bounty[3].toString()}
              </td>
            </tr>
            <tr>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                Action Rewards
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                {parseFloat(formatEther(bounty[6])) /
                  parseFloat(bounty[4].toString())}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Addresses End */}
      <div className="px-5 sm:px-6 pb-4">
        <button
          disabled={bounty[4] === bounty[5]}
          className="disabled:opacity-50 disabled:bg-zinc-800 w-full rounded-md bg-primary-400 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          onClick={() =>
            handleVerification(
              bounty[2].toString(),
              bounty[3].toString(),
              bounty[0]
            )
          }
        >
          {bounty[4] === bounty[5]
            ? "Bounty Completed"
            : isClaimLoading
            ? "Claiming"
            : isClaimSuccess
            ? "Claimed"
            : "Validate"}
        </button>
      </div>
      {isClaimSuccess && (
        <div className="mb-5 mx-5 sm:col-span-2 rounded-md bg-green-600 px-4 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon
                className="h-5 w-5 text-green-300"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-50">
                Claimed Successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      {(isClaimError || verificationError) && (
        <div className="mb-5 mx-5 sm:col-span-2 rounded-md bg-red-600 px-4 py-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon
                className="h-5 w-5 text-red-300"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-50">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
