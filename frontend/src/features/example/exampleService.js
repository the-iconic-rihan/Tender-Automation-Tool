import axios from "axios";

const getUsers = async () => {
  const response = await axios.get(
    "https://jsonplaceholder.typicode.com/users"
  );

  return response.data;
};

const exampleService = {
  getUsers,
};

export default exampleService;
