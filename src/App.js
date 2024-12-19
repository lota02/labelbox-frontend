import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '@recogito/annotorious/dist/annotorious.min.css';
import { Annotorious } from '@recogito/annotorious';
import { Container, Typography, Card, CardContent, Box, Button } from '@mui/material';

const App = () => {
  const [projects, setProjects] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const annotoriousRef = useRef(null);

  useEffect(() => {
    // Fetch all projects
    axios
      .get('http://127.0.0.1:5000/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  const fetchImages = (projectId) => {
    setSelectedProject(projectId);
    axios
      .get(`http://127.0.0.1:5000/projects/${projectId}/images`)
      .then((res) => setImages(res.data))
      .catch((err) => console.error(err));
  };

  const handleAnnotationSave = () => {
    // Save annotations to the backend
    axios
      .post(`http://127.0.0.1:5000/annotations`, {
        image_id: selectedImage.id,
        annotations: annotations,
      })
      .then(() => alert('Annotations saved!'))
      .catch((err) => console.error(err));
  };

  const initializeAnnotorious = (imageElement) => {
    if (annotoriousRef.current) {
      annotoriousRef.current.destroy();
    }
    annotoriousRef.current = new Annotorious({
      image: imageElement,
    });

    annotoriousRef.current.on('createAnnotation', (annotation) => {
      setAnnotations((prev) => [...prev, annotation]);
    });
    annotoriousRef.current.on('deleteAnnotation', (annotation) => {
      setAnnotations((prev) =>
        prev.filter((a) => a.id !== annotation.id)
      );
    });
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Labelbox Web App
      </Typography>

      {/* Projects Section */}
      {!selectedProject && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Projects</Typography>
          {projects.map((project) => (
            <Card
              sx={{
                mb: 2,
                cursor: 'pointer',
                ':hover': { background: '#f5f5f5' },
              }}
              key={project.id}
              onClick={() => fetchImages(project.id)}
            >
              <CardContent>{project.name}</CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Images Section */}
      {selectedProject && !selectedImage && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Images</Typography>
          {images.map((image) => (
            <Card
              sx={{
                mb: 2,
                cursor: 'pointer',
                ':hover': { background: '#f5f5f5' },
              }}
              key={image.id}
              onClick={() => setSelectedImage(image)}
            >
              <CardContent>{image.name}</CardContent>
            </Card>
          ))}
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => setSelectedProject(null)}>
            Back to Projects
          </Button>
        </Box>
      )}

      {/* Annotation Section */}
      {selectedImage && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6">Annotate Image: {selectedImage.name}</Typography>
          <div style={{ position: 'relative', maxWidth: '100%', marginTop: '20px' }}>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              style={{ maxWidth: '100%' }}
              onLoad={(e) => initializeAnnotorious(e.target)}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleAnnotationSave}
          >
            Save Annotations
          </Button>
          <Button
            variant="outlined"
            sx={{ mt: 2, ml: 2 }}
            onClick={() => setSelectedImage(null)}
          >
            Back to Images
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default App;

