from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate


app = Flask(__name__)
CORS(app)

# Configure the database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///projects.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
migrate = Migrate(app, db)


# Models
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=True)

class Image(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    url = db.Column(db.String(200), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)


class Annotation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    image_id = db.Column(db.Integer, db.ForeignKey('image.id'), nullable=False)
    annotation_data = db.Column(db.Text, nullable=False)  # Store JSON as text

# Routes
@app.route('/projects', methods=['POST'])
def create_project():
    data = request.json
    new_project = Project(name=data['name'], description=data.get('description'))
    db.session.add(new_project)
    db.session.commit()
    return jsonify({"message": "Project created", "project": {"id": new_project.id, "name": new_project.name}}), 201

@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{"id": p.id, "name": p.name, "description": p.description} for p in projects])

@app.route('/projects/<int:project_id>/images', methods=['POST'])
def add_image(project_id):
    data = request.json
    new_image = Image(project_id=project_id, image_url=data['image_url'])
    db.session.add(new_image)
    db.session.commit()
    return jsonify({"message": "Image added", "image": {"id": new_image.id, "image_url": new_image.image_url}}), 201

@app.route('/projects/<int:project_id>/images', methods=['GET'])
def get_images(project_id): # Get the images 
    images = Image.query.filter_by(project_id=project_id).all()
    return jsonify([{"id": i.id, "image_url": i.image_url} for i in images])


@app.route('/annotations', methods=['POST'])
def save_annotation(): # Saves the annotations 
    data = request.json
    new_annotation = Annotation(image_id=data['image_id'], annotation_data=str(data['annotations']))
    db.session.add(new_annotation)
    db.session.commit()
    return jsonify({"message": "Annotation saved"}), 201

@app.route('/annotations/<int:image_id>', methods=['GET'])
def get_annotations(image_id): # Get annotation 
    annotations = Annotation.query.filter_by(image_id=image_id).all()
    return jsonify([{"id": a.id, "data": a.annotation_data} for a in annotations])


@app.route('/populate', methods=['POST'])
def populate_database():
    try:
        # Create sample projects
        project1 = Project(name="Project 1")
        project2 = Project(name="Project 2")
        db.session.add(project1)
        db.session.add(project2)
        db.session.commit()

        # Add sample images to the projects
        image1 = Image(
            name="Sample Image 1",
            url="https://via.placeholder.com/800x600.png?text=Sample+Image+1",
            project_id=project1.id
        )
        image2 = Image(
            name="Sample Image 2",
            url="https://via.placeholder.com/800x600.png?text=Sample+Image+2",
            project_id=project1.id
        )
        image3 = Image(
            name="Sample Image 3",
            url="https://via.placeholder.com/800x600.png?text=Sample+Image+3",
            project_id=project2.id
        )

        db.session.add_all([image1, image2, image3])
        db.session.commit()

        return jsonify({"message": "Database populated with sample data!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == '__main__':
    db.create_all()  # Initialize the database
    app.run(debug=True)
    