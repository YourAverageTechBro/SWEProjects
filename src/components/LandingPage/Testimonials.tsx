import Image from "next/image";

import { Container } from "src/components/LandingPage/Container";
import avatarImage1 from "./images/avatars/avatar-1.png";
import avatarImage2 from "./images/avatars/avatar-2.png";
import avatarImage3 from "./images/avatars/avatar-3.png";
import avatarImage4 from "./images/avatars/avatar-4.png";
import avatarImage5 from "./images/avatars/avatar-5.png";
import avatarImage6 from "./images/avatars/avatar-6.png";

const testimonials = [
  [
    {
      content:
        "I love the in-depth instructions that SWEProjects has. It's been a great way to bridge that gap between what I learned in school and how to actually use that knowledge to build something!",
      author: {
        name: "Ashley Berge",
        role: "College student",
        image: avatarImage1,
      },
    },
    {
      content:
        "I love the support that SWEProjects provides. I had a lot of support during my coding bootcamp, but afterwards I felt like I was on my own. SWEProjects has been a great way to continue learning and get help when I need it.",
      author: {
        name: "Lisa Hahn",
        role: "Coding bootcamp student",
        image: avatarImage4,
      },
    },
  ],
  [
    {
      content:
        "SWEProjects has been great because it lets me see other people's solutions to these projects. As a self-taught programmer it's hard to know if I'm doing things the right way, and SWEProjects has been a great way to see how other people are solving these problems.",
      author: {
        name: "Daniel Khan",
        role: "Self taught engineer",
        image: avatarImage5,
      },
    },
    {
      content:
        'People would always give me advice to "build a personal project", but I never knew what to build or how to build it. SWEProjects has been great to give me great projects to build and also guide me on how to build them.',
      author: {
        name: "Erin DeSilva",
        role: "High school student",
        image: avatarImage2,
      },
    },
  ],
  [
    {
      content:
        "I used to watch 4 hour coding tutorials on Youtube and could never finish them because they were so boring and I would always lose my spot in the video. SWEProjects has been great because it breaks up each step into easily digestible chunks and I can always pick up where I left off.",
      author: {
        name: "Peter Limbet",
        role: "Computer science student",
        image: avatarImage3,
      },
    },
    {
      content:
        "Being an Angular developer, I wanted to learn how to use React and how to deploy projects out onto the internet using more modern tools. SWEProjects have been a great way to learn new technologies outside of my day job!",
      author: {
        name: "Brian Nguyen",
        role: "Software engineer",
        image: avatarImage6,
      },
    },
  ],
];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function QuoteIcon(props) {
  return (
    <svg aria-hidden="true" width={105} height={78} {...props}>
      <path d="M25.086 77.292c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622C1.054 58.534 0 53.411 0 47.686c0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C28.325 3.917 33.599 1.507 39.324 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Zm54.24 0c-4.821 0-9.115-1.205-12.882-3.616-3.767-2.561-6.78-6.102-9.04-10.622-2.11-4.52-3.164-9.643-3.164-15.368 0-5.273.904-10.396 2.712-15.368 1.959-4.972 4.746-9.567 8.362-13.786a59.042 59.042 0 0 1 12.43-11.3C82.565 3.917 87.839 1.507 93.564 0l11.074 13.786c-6.479 2.561-11.677 5.951-15.594 10.17-3.767 4.219-5.65 7.835-5.65 10.848 0 1.356.377 2.863 1.13 4.52.904 1.507 2.637 3.089 5.198 4.746 3.767 2.41 6.328 4.972 7.684 7.684 1.507 2.561 2.26 5.5 2.26 8.814 0 5.123-1.959 9.19-5.876 12.204-3.767 3.013-8.588 4.52-14.464 4.52Z" />
    </svg>
  );
}

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our customers are saying"
      className="bg-slate-50 py-20 sm:py-32"
    >
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/*@ts-ignore*/}
      <Container>
        <div className="mx-auto max-w-2xl md:text-center">
          <h2 className="font-display text-3xl tracking-tight text-slate-900 sm:text-4xl">
            Loved by developers worldwide.
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            See what others have to say about it.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-20 lg:max-w-none lg:grid-cols-3"
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
                {column.map((testimonial, testimonialIndex) => (
                  <li key={testimonialIndex}>
                    <figure className="relative rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/10">
                      <QuoteIcon className="absolute left-6 top-6 fill-slate-100" />
                      <blockquote className="relative">
                        <p className="text-lg tracking-tight text-slate-900">
                          {testimonial.content}
                        </p>
                      </blockquote>
                      <figcaption className="relative mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                        <div>
                          <div className="font-display text-base text-slate-900">
                            {testimonial.author.name}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">
                            {testimonial.author.role}
                          </div>
                        </div>
                        <div className="overflow-hidden rounded-full bg-slate-50">
                          <Image
                            className="h-14 w-14 object-cover"
                            src={testimonial.author.image}
                            alt=""
                            width={56}
                            height={56}
                          />
                        </div>
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
