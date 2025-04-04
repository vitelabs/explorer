## Getting Started

This project uses Vue 3.

### Prerequisites

Ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

Follow these steps to set up the project locally:

```sh
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd explorer

# Install dependencies
npm install
```

### Development

Start the local development server:

```sh
npm run serve
```

This will start a development server at `http://localhost:8080/` (default). Open this URL in your browser to view the application.

### Build for Production

To build the project for production:

```sh
npm run build
```

The production-ready files will be generated in the `dist` directory.

### Linting and Formatting

To check and fix linting issues:

```sh
npm run lint
```

### Running Tests

If the project includes tests, you can run them using:

```sh
npm run test
```

### Folder Structure

- `src/`: Contains the source code of the application.
- `public/`: Static assets and the HTML template.
- `dist/`: Generated production build files.

### Contributing

We welcome contributions! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```sh
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```sh
   git commit -m "Description of changes"
   ```
4. Push to your branch:
   ```sh
   git push origin feature-name
   ```
5. Open a pull request.

### License

This project is licensed under the [MIT License](LICENSE).
