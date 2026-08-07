export default function checkAuth(req, res) {
  const user = req.user;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
  }
  res.status(200).json(user);
}
