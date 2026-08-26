import type { Job } from "@/lib/types/job"

let jobs: Job[] = []

export function getJobs() {
  return jobs
}

export function getJob(id: string) {
  return jobs.find((job) => job.id === id)
}

export function createJob(job: Job) {
  jobs = [job, ...jobs]
  return job
}

export function updateJob(
  id: string,
  updates: Partial<Job>
) {
  jobs = jobs.map((job) =>
    job.id === id
      ? {
          ...job,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : job
  )

  return getJob(id)
}

export function deleteJob(id: string) {
  jobs = jobs.filter((job) => job.id !== id)
}
