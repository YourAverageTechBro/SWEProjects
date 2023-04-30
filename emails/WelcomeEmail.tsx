import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";

const WelcomeEmail = () => {
  return (
    <Tailwind>
      <Section style={main}>
        <div className="mb-4 flex flex-col items-center justify-center text-xl">
          <div className="w-full">
            <img
              src={
                "https://siqolvmnfkiuskuezanc.supabase.co/storage/v1/object/public/public/images/public/images/SWEProjects%20logo%20large.png?t=2023-04-28T20%3A54%3A25.768Z"
              }
              alt={"SWE Projects Logo"}
            />
            <p className="font-semi text-4xl">Welcome to SWE Projects!</p>

            <p>
              Hi, this is Dohyun (also known as YourAverageTechBro on social
              media), the founder and creator of SWE Projects.
            </p>

            <p>
              I wanted to share a few helpful resources regarding SWE Projects.
            </p>
            <ul>
              <li>
                Join
                <Link
                  className="underline hover:cursor-pointer"
                  href="https://discord.gg/2p2e5tTmzw"
                >
                  {" the Discord "}
                </Link>
                if you are running into any issues/need help
              </li>

              <li>
                Leave project/feature requests on the
                <Link
                  className="underline hover:cursor-pointer"
                  href="https://sweprojects.canny.io/feature-requests"
                >
                  {" SWE Projects Canny Board"}
                </Link>
              </li>
            </ul>

            <p>
              {
                "That's all for now — see you in the Discord and happy learning 🙂"
              }
            </p>
          </div>
        </div>
      </Section>
    </Tailwind>
  );
};

// Styles for the email template
const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

export default WelcomeEmail;
