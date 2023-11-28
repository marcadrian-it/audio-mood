interface SpinnerProps {
  color: string;
}

const Spinner = ({ color }: SpinnerProps) => {
  return (
    <div
      className={`w-[16px] h-[16px] rounded-full animate-spin border-solid border-t-transparent border-4 ${color}`}
    ></div>
  );
};

export default Spinner;
