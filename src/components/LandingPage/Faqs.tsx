import Image from "next/image";

import { Container } from "src/components/LandingPage/Container";
import backgroundImage from "./images/background-faqs.jpg";

const faqs = [
  {
    question: "How long do I have access to a project once I purchase it?",
    answer: (
      <p className="mt-4 text-sm text-slate-700">
        {`You get lifetime access to the project. That means whenever we add a
        new tech stack variation to the project, you get lifetime access to
        that, too.`}
      </p>
    ),
  },
  {
    question: "Do you offer any discounts?",
    answer: (
      <p className="mt-4 text-sm text-slate-700">
        {`Currently no, but we are looking into some ways to offer students
        discounts. If you sign up for an account, you'll be the first to know
        about any discounts.`}
      </p>
    ),
  },
  {
    question: "Can I request a type of project to be made?",
    answer: (
      <p className="mt-4 text-sm text-slate-700">
        Yep, you definitely can. You can do so
        <a
          className={"text-blue-500 underline"}
          href={"https://sweprojects.canny.io/feature-requests"}
        >
          {" "}
          here{" "}
        </a>
      </p>
    ),
  },
];

export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-slate-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -translate-y-1/4 translate-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <div className={"mx-auto mt-16 flex gap-4"}>
          {faqs.map((column, columnIndex) => (
            <div key={columnIndex} className={"w-1/3"}>
              <h3 className="font-display text-lg leading-7 text-slate-900">
                {column.question}
              </h3>
              {column.answer}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
