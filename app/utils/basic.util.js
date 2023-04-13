const getForwordingURL = async () => {
  try {
    let tunnels = await fetch("http://127.0.0.1:4040/api/tunnels");
    tunnels = await tunnels.json();
    const url = tunnels.tunnels[0].public_url;
    return url;
  } catch (err) {
    return err;
  }
};

// Filter tasks that contain .exe
const preprocessTaskList = async (tasks) => {
  let Task = [];
  for (let task of tasks) {
    if (task.includes(".exe")) {
      if (task[0] === "K") {
        task = task.slice(3, task.length);
      }
      Task.push(task);
    }
  }
  return Task;
};

module.exports = { getForwordingURL, preprocessTaskList };
