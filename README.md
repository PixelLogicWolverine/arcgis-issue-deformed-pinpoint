# DeformedPinpoint

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.0.

## Covered Esri Cases

### #03588002

> When several pinpoints are contained in a cluster, and the user navigates between them by the popup, the pinpoints are deformed.

![demo](./readme/image.png)

### #03588018

> Cluster pop-ups browse feature back button

1. Click on a cluster
2. Click on "Browse features"
3. Click on "Back"
4. Click on "Browse features"
5. Button does not work anymore

### #03587995

> Cluster highlight is visible when highlight is disabled.

In the map configuration, the highlight is disabled.  
When selecting a feature (single pinpoint or cluster), the highlight is not visible.  
But when circuling through the entities, the highlight becomes visible.  

```ts
new MapView({
    // ...
    popup: {
        highlightEnabled: false,
    },
    // ...
});
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
