const { getUserRepos } = require("../services/repoService");

exports.fetchRepos = async (req, res) => {
  try {
    const repos = await getUserRepos();
    res.json(repos);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching repos");
  }
};