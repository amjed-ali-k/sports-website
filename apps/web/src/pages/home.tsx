import { Link } from "react-router-dom";
import useSWRImmutable from "swr/immutable";
import { apiClient } from "@/lib/api";

const api = apiClient.public.events;
const url = api.$url();
const fetcher = () => api.$get().then((e) => e.json());

export const HomePage = () => {
  const { data } = useSWRImmutable(url, fetcher);
  return (
    <div className="py-8">
      <div className="flex justify-center flex-col items-center">
        <h2 className="text-4xl font-black">Welcome</h2>
        <h3>Choose an option</h3>
      </div>
      <div className="flex flex-col gap-6 p-4">
        {data?.map((event) => (
          <StyledButton
            image={event.image ?? ""}
            title={event.name}
            description={event.description || ""}
          />
        ))}
      </div>
    </div>
  );
};

const StyledButton = ({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) => {
  return (
    <button className="relative inline-flex overflow-hidden rounded-md p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
      <span className="inline-flex font-extrabold text-xl h-full w-full cursor-pointer items-center justify-center rounded-md bg-slate-950 px-3 py-1 text-white backdrop-blur-3xl">
        <Link to="/sports" className="w-full">
          <img className="h-40 w-full object-cover" src={image} />
          <div>{title}</div>
          <p className="text-sm text-muted-foreground font-normal">
            {description}
          </p>
        </Link>
      </span>
    </button>
  );
};
