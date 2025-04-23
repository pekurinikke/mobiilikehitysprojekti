using UnityEngine;

public class backgroundLoop : MonoBehaviour
{
   Transform cam;
   Vector3 camStartPos;
   float distance;

   GameObject[] backgrounds;
   Material[] mat;
   float[] backSpeed;

   [Range(0.01f,0.05f)]
   public float parallaxSpeed;

    void Start()
    {
        cam=Camera.main.transform;
        camStartPos = cam.position;

        int backCount = transform.childCount;
        mat = new Material[backCount];
        backSpeed = new float[backCount];
        backgrounds = new GameObject[backCount];

        for (int i=0; i < backCount; i++)
        {
          backgrounds[i]  = transform.GetChild(i).gameObject;
          mat[i]=backgrounds[i].GetComponent<Renderer>().material;
        }
        BackSpeedCalculate(backCount);
    }

    void BackSpeedCalculate(int backCount)
    {
      float farthestBack = 0;

       for (int i = 0; i < backCount; i++)
       {

        float zDist = backgrounds[i].transform.position.z - cam.position.z;
      if (zDist > farthestBack)
       {
        farthestBack = zDist;
       }

        }
       

       for (int i = 0; i < backCount; i++)
       {
         float zDist = backgrounds[i].transform.position.z - cam.position.z;
        backSpeed[i] = 1 - (zDist / farthestBack);
       }

    }

    private void LateUpdate()
       {
        distance = cam.position.x - camStartPos.x;

        for(int i = 0; i < backgrounds.Length; i++) 
        {
          float speed = backSpeed[i] * parallaxSpeed;
          mat[i].SetTextureOffset("_MainTex", new Vector2(distance,0)*speed);
        }
       }












    // Update is called once per frame
    void Update()
    {
        
    }
}
