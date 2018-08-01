export function currentUser(): Promise<*> {
  return fetch(`/current-user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}

export function login(username: string, password: string): Promise<*> {
  return fetch(`/omk/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
    body: JSON.stringify({
      username,
      password
    })
  })
    .then(handleErrors)
    .then(res => {
      return res.json();
    });
}
