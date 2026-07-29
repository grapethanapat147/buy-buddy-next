/** Green "Login with LINE" button — starts the LINE OAuth flow (server route). */
export default function LineLoginButton({
  label = "เข้าสู่ระบบด้วย LINE",
}: {
  label?: string;
}) {
  return (
    <a
      href="/auth/line/start"
      className="flex w-full items-center justify-center gap-2.5 rounded-full p-3.5 text-base font-bold text-white shadow-soft transition hover:brightness-95 active:scale-[0.98]"
      style={{ backgroundColor: "#06C755" }}
    >
      <span
        className="grid h-6 w-6 place-items-center rounded-md bg-white text-[10px] font-black leading-none"
        style={{ color: "#06C755" }}
        aria-hidden="true"
      >
        LINE
      </span>
      {label}
    </a>
  );
}
