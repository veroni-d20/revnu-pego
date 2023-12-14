import { Fragment, useEffect, useRef, useState } from "react";
import Head from "next/head";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useContractRead, useContractWrite } from "wagmi";
import DEPLOYED_CONTRACTS from "@/utilities/contractDetails";
import ApplicationLayout from "@/components/Utilities/ApplicationLayout";
import { useAccount } from "wagmi";
import { Dialog, Transition } from "@headlessui/react";
import { formatEther, parseEther } from "viem";

const actionMethods = [
  { id: "like", title: "Like" },
  { id: "comment", title: "Comment" },
  { id: "subscribe", title: "Subscribe" },
];

export default function CreateBounty() {
  const [open, setOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const { address } = useAccount();

  const [inputs, setInputs] = useState({
    actionId: "",
    actionType: "",
    actionCount: 0,
    reward: 0,
  });

  const handleInput = (event: {
    persist: () => void;
    target: { id: any; value: any };
  }) => {
    event.persist();
    setInputs((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));
  };

  let approvedAmt = inputs.reward;

  const {
    data: approveData,
    isLoading: isApproveLoading,
    isSuccess: isApproveSuccess,
    write: approveTokens,
  } = useContractWrite({
    address: DEPLOYED_CONTRACTS.REVNU_TOKEN.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_TOKEN.abi,
    functionName: "approve",
  });

  const {
    data: allowanceData,
    isLoading: isAllowanceLoading,
    isSuccess: isAllowanceSuccess,
  } = useContractRead({
    address: DEPLOYED_CONTRACTS.REVNU_TOKEN.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_TOKEN.abi,
    functionName: "allowance",
    args: [address, DEPLOYED_CONTRACTS.REVNU_REGISTRY.address],
  });

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    write: createBounty,
  } = useContractWrite({
    address: DEPLOYED_CONTRACTS.REVNU_REGISTRY.address as `0x${string}`,
    abi: DEPLOYED_CONTRACTS.REVNU_REGISTRY.abi,
    functionName: "createBounty",
    onError(error) {
      console.log("Error", error);
    },
  });

  //Approve Tokens
  const handleApprove = (approvedAmt: number) => {
    approveTokens({
      args: [
        DEPLOYED_CONTRACTS.REVNU_REGISTRY.address,
        parseEther(approvedAmt.toString()),
      ],
    });
  };

  useEffect(() => {
    if (isApproveSuccess) setOpen(false);
  }, [isApproveSuccess]);

  // Submit form
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if ((allowanceData as any) < inputs.reward) {
      setOpen(true);
    } else {
      createBounty({
        args: [
          inputs.actionId,
          inputs.actionType,
          inputs.actionCount,
          parseEther(inputs.reward.toString()),
        ],
      });
    }
  };

  return (
    <>
      <Head>
        <title>
          Dashboard - Revnu | Like, Comment & Subscribe to earn Pego tokens
        </title>
      </Head>

      <ApplicationLayout
        customHeader="Create A Bounty"
        // customHeaderDescription="Electra makes it extremely easy for your to charge your EV at virtually any Electra-enabled charging station."
      >
        <div className="rounded-md bg-white px-5 py-6 shadow sm:px-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-md my-2 px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-zinc-300 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-zinc-900"
              >
                Entity Link
              </label>
              <input
                type="text"
                name="actionId"
                id="actionId"
                onChange={handleInput}
                value={inputs.actionId}
                className="block w-full border-0 p-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="https://www.youtube.com/watch?v=o5uGF2598w0"
              />
            </div>
            <div>
              <label className="text-base font-semibold text-gray-900">
                Action Type
              </label>
              <fieldset className="mt-1">
                <legend className="sr-only">Action Type</legend>
                <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                  {actionMethods.map((actionMethod) => (
                    <div key={actionMethod.id} className="flex items-center">
                      <input
                        id="actionType"
                        name="notification-method"
                        type="radio"
                        onChange={handleInput}
                        value={actionMethod.id}
                        defaultChecked={actionMethod.id === "email"}
                        className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600"
                      />
                      <label
                        htmlFor={actionMethod.id}
                        className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                      >
                        {actionMethod.title}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="rounded-md my-2 px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-zinc-300 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="actionCount"
                className="block text-xs font-medium text-zinc-900"
              >
                Count
              </label>
              <input
                type="text"
                name="actionCount"
                id="actionCount"
                onChange={handleInput}
                value={inputs.actionCount}
                className="block w-full border-0 p-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="5"
              />
            </div>

            <div className="rounded-md my-4 px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-zinc-300 focus-within:ring-2 focus-within:ring-primary-400">
              <label
                htmlFor="reward"
                className="block text-xs font-medium text-zinc-900"
              >
                Reward
              </label>
              <input
                type="text"
                name="reward"
                id="reward"
                onChange={handleInput}
                value={inputs.reward}
                className="block w-full border-0 p-0 text-zinc-900 placeholder:text-zinc-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="0"
              />
            </div>

            {isSuccess && (
              <div className="mt-6 sm:col-span-2 rounded-md bg-green-600 px-4 py-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon
                      className="h-5 w-5 text-green-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-50">
                      We have received your application!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {isError && (
              <div className="mt-6 sm:col-span-2 rounded-md bg-red-600 px-4 py-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon
                      className="h-5 w-5 text-red-300"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-50">
                      Uh oh! Something went wrong. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-3 flex justify-end">
              <button
                type="submit"
                className={`rounded-md bg-primary-400 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400" ${
                  isLoading && "opacity-50 cursor-progress"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  "Creating Bounty"
                ) : (
                  <span className="flex justify-center gap-x-2">
                    Register <span aria-hidden="true">→</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
        <Transition.Root show={open} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-10"
            initialFocus={cancelButtonRef}
            onClose={setOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <div>
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                        <ExclamationCircleIcon
                          className="h-6 w-6 text-yellow-500"
                          aria-hidden="true"
                        />
                      </div>
                      <div className="mt-3 text-center sm:mt-5">
                        <Dialog.Title
                          as="h3"
                          className="text-base font-semibold leading-6 text-gray-900"
                        >
                          Insufficient Allowance
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Approve some tokens in order to create a bounty
                            (Minimum of {inputs.reward})
                          </p>
                        </div>
                        <input
                          type="number"
                          name="approveTokens"
                          id="approveTokens"
                          className="block w-full mt-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          placeholder="0"
                          onChange={(e) =>
                            (approvedAmt = parseInt(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                        onClick={() => handleApprove(approvedAmt)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                        onClick={() => setOpen(false)}
                        ref={cancelButtonRef}
                      >
                        Cancel
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </ApplicationLayout>
    </>
  );
}
