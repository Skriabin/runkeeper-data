import os
from flask import Flask, redirect, render_template, request, flash, url_for, json
from markupsafe import escape
from werkzeug.utils import secure_filename


app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = os.path.join(app.instance_path, 'uploads')
app.config["UPLOAD_EXTENSIONS"] = ['.csv']

# Check if upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

app.secret_key = 'many random bytes'

ALLOWED_EXTENSIONS = ['csv']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.')[1].lower() in ALLOWED_EXTENSIONS

def process_file(filename):
    path = app.config['UPLOAD_FOLDER'] + '\\' + filename

    with open(path, 'r') as f:
        # Obtain CSV file headers by INDEX
        header = f.readline()
        dateHeader = (header.rsplit(','))[1]
        distHeader = (header.rsplit(','))[4]
        paceHeader = (header.rsplit(','))[6]

        # Establish variables
        purged_items = 0
        array = []

        # Loop over rows in the file
        x = f.readlines()
        for row in x[1: ]:
            items = row.rsplit(',')
            full_date = items[1]
            distance = items[4]
            pace = items[6]

            # Remove runs without pace
            if (pace == ""):
                purged_items += 1
                continue

            # remove excessive times 
            minutes = int((pace.rsplit(':'))[0])
            if (minutes >= 17):
                purged_items += 1
                continue

            # remove hours & minutes from date
            short_date = ""
            for char in full_date:
                if char != " ":
                    short_date += char
                else:
                    break

            # Create a dictionary & append to array
            dict = {dateHeader: short_date, paceHeader: pace, distHeader: distance}
            array.append(dict)
        f.close()

    output = json.dumps(array)
    return output





@app.route("/")
def home():
    return render_template('home.html')

@app.route("/upload", methods=['POST'])
def upload():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file was submitted')
            return render_template("home.html")
        file = request.files['file']
        # if the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            file_data = process_file(filename)
            flash(filename)
            return render_template('home.html', file_data=file_data)
    return "FAILED"

@app.route("/dashboard")
def dashboard():
    try:
        searchword = request.args.get('username')
    except Exception as e:
        searchword = e
    return render_template("dashboard.html", searchword=searchword)