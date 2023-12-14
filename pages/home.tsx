import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import axios from "axios";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import DEPLOYED_CONTRACTS from "@/utilities/contractDetails";
import numeral from "numeral";
import ApplicationLayout from "@/components/Utilities/ApplicationLayout";
import Link from "next/link";
import { formatEther } from "viem";

export default function Home() {
  const { address } = useAccount();

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

  // get balance of logged user

  const {
    data: balance,
    isBalanceError,
    isBalanceLoading,
    isBalanceSuccess,
  }: any = useContractRead({
    address: DEPLOYED_CONTRACTS.REVNU_TOKEN.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_TOKEN.abi,
    functionName: "balanceOf",
    args: [address],
  });

  const {
    data: earnings,
    isEarningsError,
    isEarningsLoading,
    isEarningsSuccess,
  }: any = useContractRead({
    address: DEPLOYED_CONTRACTS.REVNU_REGISTRY.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_REGISTRY.abi,
    functionName: "claimEarnings",
    args: [address],
  });

  const bountiesContainerRef: any = useRef(null);
  const [showEmptyState, setShowEmptyState] = useState(false);

  const range: any = (n: number) =>
    Array.from(Array(n).keys()).map((n) => n + 1);

  useEffect(() => {
    if (lastBountyId) {
      let bounties = range(parseInt(lastBountyId));
      setBounties(bounties);
    }

    // Show Empty State if there are no bounties
    if (bountiesContainerRef.current.children.length == 0) {
      setShowEmptyState(true);
    }
  }, [lastBountyId, bountiesContainerRef]);

  return (
    <>
      <Head>
        <title>
          Dashboard - Revnu | Like, Comment & Subscribe to earn Pego tokens
        </title>
      </Head>

      <ApplicationLayout customHeader="Your Dashboard">
        {/* Tokens Balance Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 rounded-md bg-white px-5 py-6 shadow sm:px-6">
          <div>
            <div className="font-black text-zinc-900 text-2xl">
              Earning Balance
            </div>
            <div className="mt-1 font-medium text-gray-500 text-sm">
              Total tokens you have claimed
            </div>
            {earnings ? (
              <div className="mt-5 font-black text-5xl text-gray-900">
                {numeral(formatEther(earnings)).format("0 a").toUpperCase()}{" "}
                <span className="text-base text-gray-500 font-medium">
                  RVTK
                </span>
              </div>
            ) : (
              <div className="mt-5 font-black text-5xl text-gray-900">
                0{" "}
                <span className="text-base text-gray-500 font-medium">
                  RVTK
                </span>
              </div>
            )}
          </div>

          <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
            <div>
              <div className="font-black text-zinc-900 text-2xl">
                Your Balance
              </div>
              <div className="mt-1 font-medium text-gray-500 text-sm">
                Tokens you poses in your account
              </div>
              {balance ? (
                <div className="mt-5 font-black text-5xl text-gray-900">
                  {numeral(formatEther(balance)).format("0 a").toUpperCase()}{" "}
                  <span className="text-base text-gray-500 font-medium">
                    RVTK
                  </span>
                </div>
              ) : (
                <div className="mt-5 font-black text-5xl text-gray-900">
                  0{" "}
                  <span className="text-base text-gray-500 font-medium">
                    RVTK
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Tokens Balance End */}
        <div className="m-2">
          <div
            ref={bountiesContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-5 gap-y-5"
          >
            {bounties.map((bounty: number[], index: number) => (
              <BountyCard bountyId={bounty} key={index} userOnly={true} />
            ))}
          </div>

          {showEmptyState && (
            <Link
              href={"create-bounty"}
              className="relative block w-full mt-2 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
        </div>
      </ApplicationLayout>
    </>
  );
}

function BountyCard({ bountyId, key, userOnly = false }: any) {
  const { address } = useAccount();
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

  return address && isLoading
    ? "Loading"
    : userOnly && address?.toString() == bounty[1].toString() && (
        <div key={key} className={`bg-white border border-gray-200 rounded-md`}>
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
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right">
                    {bounty[2].toString()}
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
        </div>
      );
}
