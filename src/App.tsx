import "./index.css";

import { Button } from "./components/Button";
import { TechDiagram } from "./components/TechDiagram";
import { devModeUsage } from "./dev-mode-toggle";
import { useEffect } from "react";

export function App() {
  useEffect(() => {
    devModeUsage();
  }, []);
  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      <main>
        <div className="max-w-7xl mx-auto px-2 py-16">
          <section className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center overflow-x-visible">
              <div className="order-1">
                <h1 className="sm:text-6xl text-4xl mb-4 font-semibold text-gray-900 xl:whitespace-nowrap whitespace-normal">
                  What the hell have you built.{" "}
                </h1>

                <ul className="space-y-2 mb-6 sm:text-2xl text-xl text-gray-800">
                  <li className="flex items-start">
                    <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                    <span>Did you just pick things at random?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                    <span>Why is Redis talking to MongoDB?</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                    <span>
                      Why do you even <em>use</em> MongoDB?
                    </span>
                  </li>
                </ul>

                <div className="flex flex-wrap sm:gap-6 gap-2 sm:ps-6">
                  <Button variant="goddamnit">Goddamnit</Button>
                  <Button variant="nevermind">Nevermind</Button>
                </div>
              </div>

              <div className="order-2 overflow-x-auto">
                <TechDiagram />
              </div>
            </div>
          </section>

          <section className="border-t-[3px] border-gray-500 pt-16 mb-16">
            <h2 className="sm:text-5xl text-2xl font-semibold mb-8 text-gray-900">Let's talk about scale.</h2>

            <ul className="space-y-4 mb-12 sm:text-2xl text-xl text-gray-800 max-w-3xl">
              <li className="flex items-start">
                <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                <span>How many users do you actually have?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                <span>Did you just assume you'd be the next Facebook?</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                <span>A single Postgres instance would have been fine.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-4 sm:text-3xl text-2xl">▪</span>
                <span>But no, you went with a distributed system.</span>
              </li>
            </ul>

            <div className="bg-white p-8 rounded-lg border-4 border-gray-900 inline-block shadow-xl">
              <p className="sm:text-3xl text-2xl text-gray-900">
                Current users: <span className="text-[#E8424A]">12</span>
              </p>
              <p className="sm:text-lg text-base text-gray-600 mt-2">(6 of them are your test accounts)</p>
            </div>
          </section>

          <section className="border-t-[3px] border-gray-500 pt-16 mb-16">
            <h2 className="sm:text-5xl text-2xl mb-8 font-semibold text-gray-900">Your deployment strategy.</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg">
                <h3 className="sm:text-2xl text-xl mb-4 text-gray-900">What you have:</h3>
                <ul className="space-y-2 sm:text-xl text-lg text-gray-700">
                  <li>• 15 microservices</li>
                  <li>• 8 different databases</li>
                  <li>• Kubernetes cluster (3 environments)</li>
                  <li>• 4 message queues</li>
                  <li>• Service mesh</li>
                  <li>• CI/CD pipeline that takes 2 hours</li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg">
                <h3 className="sm:text-2xl text-xl mb-4 text-[#3CB371]">What you need:</h3>
                <ul className="space-y-2 sm:text-xl text-lg text-gray-700">
                  <li>• A single server</li>
                  <li>• Postgres</li>
                  <li>• Maybe Redis for caching</li>
                  <li>• That's it</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-6">
              <Button variant="goddamnit">I refuse to simplify</Button>
              <Button variant="nevermind" showRibbon={false}>
                You might have a point
              </Button>
            </div>
          </section>

          <section className="border-t-[3px] border-gray-500 pt-16">
            <h2 className="sm:text-5xl text-2xl mb-8 font-semibold text-gray-900">The real question is...</h2>

            <p className="sm:text-3xl text-xl text-gray-800 mb-12 max-w-4xl leading-relaxed">
              Can you explain to a junior developer what your system does without drawing a diagram that looks like a
              bowl of spaghetti?
            </p>

            <div className="bg-linear-to-b from-[#E8424A] to-[#C1272D] p-12 rounded-lg text-white text-center shadow-xl">
              <p className="sm:text-4xl text-2xl mb-4 font-semibold">Complexity is not a virtue.</p>
              <p className="sm:text-2xl text-xl">Start simple. Add complexity only when you have proof you need it.</p>
            </div>
          </section>
        </div>
      </main>

      <footer className=" text-black py-4 text-center">
        <p className="sm:text-2xl text-lg">
          (C) {new Date().getFullYear()}{" "}
          <a href="https://sacha.house" className="text-blue-500 visited:text-purple-500 hover:underline">
            sacha.house
          </a>{" "}
          -{" "}
          <a
            href="https://web.archive.org/web/20130402223000/http://boundary.com/"
            className="text-blue-500 visited:text-purple-500 hover:underline"
          >
            original inspiration
          </a>{" "}
          -{" "}
          <a
            href="https://gitlab.com/sachahjkl/wthhyb.sacha.house"
            className="text-blue-500 visited:text-purple-500 hover:underline"
          >
            source code
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
