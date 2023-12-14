import Image from "next/image";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Hero() {
  return (
    <>
      <div
        id="home"
        className="relative isolate overflow-hidden bg-primary-900 pb-16 pt-0 sm:pb-20"
      >
        <Image
          src="/hero.jpeg"
          alt="YouTuber"
          height={1268}
          width={2126}
          className="absolute inset-0 -z-10 h-full w-full object-cover backdrop-opacity-20 backdrop-invert bg-primary/50"
        />
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-950 to-sky-950 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl py-32 sm:py-48 lg:pt-48 lg:pb-56">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-zinc-400 ring-1 ring-white/10 hover:ring-white/20">
                Revnu is powered by{" "}
                <a
                  href="https://pego.network/"
                  className="font-semibold text-white"
                  target="_blank"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  Pego Network <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black tracking-tight text-white sm:text-6xl space-y-3">
                <div>
                  <span className="text-primary-600">
                    Like, Comment & Subscribe
                  </span>{" "}
                  while earning Pego tokens!
                </div>
              </div>
              <p className="mt-6 text-lg leading-8 text-zinc-300">
                Revnu: Elevate your YouTube experience! Earn valuable tokens for
                liking, commenting, and subscribing. Join us now and be part of
                the future of content engagement.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <ConnectButton />
                <a
                  href="#"
                  className="text-sm font-semibold leading-6 text-white"
                >
                  Live demo <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-950 to-sky-950 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </>
  );
}
