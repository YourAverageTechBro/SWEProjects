import { Link } from "@react-email/link";
import { Section } from "@react-email/section";
import { Tailwind } from "@react-email/tailwind";

type Props = {
  projectName: string;
  projectUrl: string;
};
const ProjectPurchaseEmail = ({ projectName, projectUrl }: Props) => {
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
            <p className="font-semi text-4xl">
              Congrats on purchasing the {projectName} tutorial!
            </p>

            <p className="font-semi text-4xl">
              Click on the button below to access the tutorial
            </p>

            <Link
              href={projectUrl}
              className="w-full justify-center rounded-full bg-blue-600 px-6 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Start The {projectName} Tutorial
            </Link>

            <p>
              If you run into any issues, stop by
              <Link
                className="underline hover:cursor-pointer"
                href="https://discord.gg/2p2e5tTmzw"
              >
                {" the Discord "}
              </Link>
              and let us know! We will help you out as soon as we can.
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

export default ProjectPurchaseEmail;
