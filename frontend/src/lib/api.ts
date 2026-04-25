export async function analyzePhotos(files: FileList) {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  // Aquí posarem la URL de l'ordinador del teu amic (ex: http://192.168.1.XX:8000)
  const response = await fetch('http://localhost:8000/analyze', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}