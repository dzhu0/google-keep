# Google Keep Clone with Firebase Integration

This project is a simple web application that mimics the functionality of Google Keep, allowing users to create, edit, and delete notes. The application is built using HTML, CSS, and JavaScript, with Firebase serving as the backend database.

## Features

- **Real-time Data Synchronization:** The application uses Firebase Realtime Database to store and retrieve notes. Any changes made by one user are instantly reflected for all connected users.

- **Note CRUD Operations:** Users can create new notes, edit existing ones, and delete notes. The notes are displayed in a visually appealing layout with a title, text, and toolbar for color selection and deletion.

- **Color Customization:** Each note can be assigned a different color for better organization and personalization.

## Getting Started

1. Clone the repository to your local machine:

    ```bash
    git clone https://github.com/dzhu0/google-keep.git
    ```

2. Open the `index.html` file in your web browser.

3. Configure Firebase:
    - Create a new Firebase project: [Firebase Console](https://console.firebase.google.com/).
    - Copy your Firebase project's configuration object and replace the `appSettings` object in `app.js` with your configuration.

4. Run the application.

## Usage

- **Creating a Note:**
  - Click on the text area to open the note editing form.
  - Enter a title and text for the note, then click "Submit" to add the note.

- **Editing a Note:**
  - Click on an existing note to open the note editing modal.
  - Make changes to the title or text, and click "Close" to update the note.

- **Deleting a Note:**
  - Click on the delete icon in the toolbar of a note to remove it from the application.

- **Changing Note Color:**
  - Click on the color palette icon in the toolbar of a note to open the color tooltip.
  - Select a color from the tooltip to change the note's background color.

## Notes

- **Real-time Updates:**
  - The application leverages the `onValue` function to listen for changes in the Firebase database and update the UI in real time.

- **Color Tooltip:**
  - The color tooltip provides a visual interface for users to select a color for their notes. It appears when clicking on the color palette icon.

- **Modal for Detailed Editing:**
  - The modal window is used for more detailed editing of notes, providing a larger text area and a color preview.

## Contributing

Feel free to contribute to the project by creating issues, suggesting enhancements, or submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

Enjoy using the Google Keep Clone with Firebase Integration! If you encounter any issues or have suggestions, please don't hesitate to contribute or reach out.
