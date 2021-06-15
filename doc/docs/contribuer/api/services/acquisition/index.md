---
title: Acquisition
---

# Acquisition service


## Actions

#### CancelJourneyAction

- signature: `acquisition:cancel`
- permissions: `['journey.create']`

Cancel a stored journey from `carpool.carpools` table by setting the status to `canceled`.

#### CreateJourneyAction

- signature: `acquisition:create`
- permissions: `['journey.create']`

Store a journey (1 driver and 1 passenger) into `acquisition.acquisitions` and pass it
to the normalisation pipeline.
The normalised journey will be stored in `carpool.carpools` before being processed by the
fraud detection service.

> _journey_ is a legacy name for acquisition.