export default function ForgotHeader({ tAuth }) {
  return (
    <header className="forgotHeader">
      <p className="forgotEyebrow">C I N E T I M E</p>
      <h1 className="forgotTitle">{tAuth("forgot.title")}</h1>
      <p className="forgotSubtitle">{tAuth("forgot.subtitle")}</p>
    </header>
  );
}
